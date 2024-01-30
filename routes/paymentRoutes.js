const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../controllers/emailController");
const Payment = require("../models/Payment");
const InitPayment = require("../models/InitPayment");

const jwtSecret = process.env.JWT_SECRET;

router.get("/checkout/:amount/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { userId } = jwt.verify(token, jwtSecret);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.params.amount) {
      return res.status(404).json({ message: "Amount not found" });
    }
    if (!user.name || !user.phoneNumber) {
      return res
        .status(404)
        .json({ message: "Name or phone number not found" });
    }

    const merchantTransactionId = crypto.randomBytes(16).toString("hex");
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: "MUID" + Date.now(),
      name: user.name,
      amount: req.params.amount * 100,
      redirectUrl:
        process.env.PHONEPAY_REDIRECT_URL +
        "/api/payment/status/" +
        merchantTransactionId +
        "/" +
        process.env.MERCHANT_ID +
        "/" +
        req.params.amount +
        "/" +
        token,
      redirectMode: "GET",
      mobileNumber: user.phoneNumber, // corrected property name 'phone' to 'phoneNumber'
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.PHONEPAY_API_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = process.env.PHONEPAY_API_URL + "/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios(options);
    const initpayment = await InitPayment.create({
      body: data
    })
    return res
      .status(200)
      .json({ url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.get(
  "/status/:transactionId/:merchantId/:amount/:token",
  async (req, res) => {
    const merchantTransactionId = req.params.transactionId;
    const merchantId = req.params.merchantId;
    const amount = req.params.amount;
    const token = req.params.token;
    const { userId } = jwt.verify(token, jwtSecret);
    const user = await User.findById(userId);

    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
      process.env.PHONEPAY_API_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url: `${process.env.PHONEPAY_API_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };

    // CHECK PAYMENT TATUS
    axios
      .request(options)
      .then(async (response) => {

        if (response.data.success === true) {
          if (response.data.data.state === "COMPLETED") {
            const { name, email, phoneNumber } = user;
            const paymentAmount = response.data.data.amount / 100;
            let local = "";
            if (user.panchayath) {
              local = user.panchayath
            }

            if (user.corporation) {
              local = user.corporation
            }

            if (user.municipality) {
              local = user.municipality
            }
            const payment = await Payment.findOne({ merchantTransactionId });
            if (payment) {
              return res.status(404).json({ message: "Payment Already done" });
            }
            const payments = await Payment.create({
              userId,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
              body: response.data.data,
              name: name || "",
              email: email || "",
              phone: phoneNumber || "",
              district: user.district || "",
              assembly: user.assembly || "",
              local: local  || "",
            });
            user.payments.push({
              paymentId: payments._id,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
            });
            await user.save();

            const htmlContent = sendMail(
              email,
              "Payment Successful",
              "Payment Successful",
              `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">INTUC APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${name},</p>
        <p>Thank you for your Contribution to INTUC Thrissur</p>
        <p><b>PAYMENT DETAILS</b></p>
        <h4 style="background:#ffffff;margin: 0 auto;width: max-content;padding: 0 10px;color: black;border-radius: 4px;">Amount Rs.${paymentAmount}</h4>
        <p>Account Transaction Id is ${merchantTransactionId}<br>Phone ${phoneNumber}</p>
        <p>For App Support Contact app@intucthrissur.com</p>
        <p style="font-size:0.9em;">Sincerely,<br />Sundaran Kunnathully<br />President of INTUC Thrissur</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>INTUC APP</p>
        </div>
      </div>
    </div>`
            );

            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/success`;
            return res.redirect(url);
          } else {
            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
            return res.redirect(url);
          }
        } else {
          const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
          return res.redirect(url);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
);

router.post(
  "/status/:transactionId/:merchantId/:amount/:token",
  async (req, res) => {
    const merchantTransactionId = req.params.transactionId;
    const merchantId = req.params.merchantId;
    const amount = req.params.amount;
    const token = req.params.token;
    const { userId } = jwt.verify(token, jwtSecret);
    const user = await User.findById(userId);

    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
      process.env.PHONEPAY_API_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url: `${process.env.PHONEPAY_API_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };

    // CHECK PAYMENT TATUS
    axios
      .request(options)
      .then(async (response) => {

        if (response.data.success === true) {
          if (response.data.data.state === "COMPLETED") {
            const { name, email, phoneNumber } = user;
            const paymentAmount = response.data.data.amount / 100;
            let local = "";
            if (user.panchayath) {
              local = user.panchayath
            }
            if (user.corporation) {
              local = user.corporation
            }
            if (user.municipality) {
              local = user.municipality
            }
            const payment = await Payment.findOne({ merchantTransactionId });
            if (payment) {
              return res.status(404).json({ message: "Payment Already done" });
            }
            const payments = await Payment.create({
              userId,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
              body: response.data.data,
              name: name || "",
              email: email || "",
              phone: phoneNumber || "",
              district: user.district || "",
              assembly: user.assembly || "",
              local: local  || "",
            });
            user.payments.push({
              paymentId: payments._id,
              merchantId,
              merchantTransactionId,
              amount: paymentAmount,
              date: new Date().toLocaleDateString(),
            });
            await user.save();

            const htmlContent = sendMail(
              email,
              "Payment Successful",
              "Payment Successful",
              `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">INTUC APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${name},</p>
        <p>Thank you for your Contribution to INTUC Thrissur</p>
        <p><b>PAYMENT DETAILS</b></p>
        <h2 style="background:#ffffff;margin: 0 auto;width: max-content;padding: 0 10px;color: black;border-radius: 4px;">Amount Rs.${paymentAmount}</h2>
        <p><b>Account Transaction Id:</b> ${merchantTransactionId}<br><b>Phone:</b> ${phoneNumber}</p>
        <p>For App Support Contact app@intucthrissur.com</p>
        <p style="font-size:0.9em;">Sincerely,<br />Sundaran Kunnathully<br />President ofINTUC Thrissur</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>INTUC APP</p>
        </div>
      </div>
    </div>`
            );

            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/success`;
            return res.redirect(url);
          } else {
            const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
            return res.redirect(url);
          }
        } else {
          const url = `${process.env.PHONEPAY_REDIRECT_URL}/api/payment/failure`;
          return res.redirect(url);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
);

router.get("/success", (req, res) => {
  res.redirect("https://intucthrissur.com");
});
router.get("/failure", (req, res) => {
  res.redirect("https://intucthrissur.com");
});
router.get("/payment-details/:page/:limit", async (req, res) => {
  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);

  try {
    const totalCount = await Payment.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const payments = await Payment.find().skip(skip).limit(limit).sort({ _id: -1 }).exec();

    res.status(200).json({
      data: payments,
      page,
      totalPages,
      totalPayments: totalCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/top-payments/:page/:limit", async (req, res) => {
  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);

  try {
    const totalCount = await Payment.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const payments = await Payment.aggregate([
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
          name: { $last: "$name" }, // Assuming "name" is a field in the Payment collection
          email: { $last: "$email" }, // Assuming "email" is a field in the Payment collection
          phone: { $last: "$phone" }, // Assuming "phone" is a field in the Payment collection
          district: { $last: "$district" }, // Assuming "district" is a field in the Payment collection
          assembly: { $last: "$assembly" }, // Assuming "assembly" is a field in the Payment collection
          local: { $last: "$local" }, // Assuming "local" is a field in the Payment collection
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
    ]);


    res.status(200).json({
      data: payments,
      page,
      totalPages,
      totalPayments: totalCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/total-amount", async (req, res) => {
  try {
    const totalAmountResult = await Payment.aggregate([
      {
        $group: {
          _id: null, // Grouping without any specific field
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    res.status(200).json({
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
