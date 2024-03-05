const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Gallery = require("../models/Galley");
const { sendMail } = require("./emailController");
const { createCanvas, loadImage } = require("canvas");
const qr = require("qrcode");
const fs = require("fs");
const Feedback = require("../models/FeedBack");
const admin = require("firebase-admin");
const serviceAccount = require("../firebase/firebase");
const Poll = require("../models/Poll");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const axios  = require("axios");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your Firebase project config
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const jwtSecret = process.env.JWT_SECRET;
const register = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const {
      name,
      email,
      password,
      phoneNumber,
      date_of_birth,
      district,
      constituency,
      assembly,
      panchayath,
      union,
     corporation,
     municipality
    } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    // // Step 2: Validate User Input
    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !date_of_birth ||
      !district ||
      !constituency ||
      !assembly
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Validate password strength (add your own criteria)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Step 3: Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    //find age from date o birth

    // Step 4: Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      whatsappNumber:phoneNumber,
      date_of_birth,
      district,
      constituency,
      assembly,
      panchayath:panchayath || "",
      union:union || "",
      corporation:corporation ||  "",
      municipality:municipality  || ""
    });
    const savedUser = await newUser.save();

    // Step 5: Generate JWT
    const token = jwt.sign({ userId: savedUser._id }, jwtSecret, {
       expiresIn: "36500d",
    });
   
    // Step 6: Send Response
    res.json({
      token,
      user: { id: savedUser._id, name: savedUser.name },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { email, password } = req.body;

    // Step 2: Validate User Input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide both email and password." });
    }

    // Step 3: Find User by Email
    const user = await User.findOne({ email });
    // Step 4: Verify User and Password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Step 5: Generate JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
       expiresIn: "36500d",
    });

    // Step 6: Send Response
    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const protected = async (req, res) => {
  try {
    if (req.user) {
      res.status(200).json({ message: "You are authorized" });
    } else {
      res.status(400).json({ message: "You are not authorized" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const details = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // This will exclude the password field from the result
    res.status(200).json(user);
  } catch (error) {
    console.error("Error during fetching user details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const {
      name,
      // email,
      password,
      phoneNumber,
      whatsappNumber,
      date_of_birth,
      addaar,
      pan_card,
      blood_group,
      district,
      constituency,
      assembly,
      panchayath,
      union,
      municipality,
      corporation
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    // If fields exist, update them
    if (name) {
      user.name = name;
    }
    // if (email) {
    //   user.email = email;
    // }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update additional fields
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }
    if (whatsappNumber) {
      user.whatsappNumber = whatsappNumber;
    }
    if (date_of_birth) {
      user.date_of_birth = new Date(date_of_birth);
    }

    if (district) {
      user.district = district;
    }
    if (constituency) {
      user.constituency = constituency;
    }
    if (assembly) {
      user.assembly = assembly;
    }
    if (panchayath) {
      user.panchayath = panchayath;
    }
    if (addaar) {
      user.addaar = addaar;
    }
    if (pan_card) {
      user.pan_card = pan_card;
    }

    if (blood_group) {
      user.blood_group = blood_group;
    }   
    if (union) {
      user.union = union;
    }
     if (municipality) {
      user.municipality = municipality;
    }     
    if (corporation) {
      user.corporation = corporation;
    }
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error during update:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user.userId });
    console.log(user);
    res.status(200).json({ message: "Account Deleted Successfully" });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const sendOTP = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { email } = req.body;

    // Step 2: Validate User Input
    if (!email) {
      return res.status(400).json({ error: "Please provide email." });
    }

    // Step 3: Find User by Email
    const user = await User.findOne({ email: email });

    // Step 4: Check if the user is already verified
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ error: "User already verified" });
    }

    // Step 5: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Step 6: Send OTP to email
    sendMail(
      email,
      "OTP Verification",
      `Your OTP is: ${otp}`,
      `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${process.env.SITE_NAME} APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${user.name},</p>
        <p>Thank you for choosing ${process.env.SITE_NAME}. Use the following OTP to complete your Sign Up procedures. OTP is valid for 20 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />${process.env.SITE_NAME}</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>${process.env.SITE_NAME}</p>
        </div>
      </div>
    </div>`
    )
      .then(async (result) => {
        console.log(result);

        // Step 7: Save OTP to the database
        user.otp = otp;
        await user.save();

        // Step 8: Send Response
        res.status(200).json({ message: "OTP sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.message);
        res.status(400).json({ message: "OTP failed" });
      });
  } catch (error) {
    console.error("Error during OTP generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const verifyOTP = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { email, otp } = req.body;

    // Step 2: Validate User Input
    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: "Please provide both email and OTP." });
    }

    // Step 3: Find User by Email
    const user = await User.findOne({ email: email });

    // Step 4: Verify User and OTP
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (otp !== user.otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    // Step 5: Update verified field
    user.verified = true;
    await user.save();

    // Step 6: Send Response
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
       expiresIn: "36500d",
    });
    await sendMail(
      user.email,
      "Account Created Successfully",
      `Congratulations Your Account has been created successfully`,
      `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${process.env.SITE_NAME} APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${user.name},</p>
        <p>WELCOME TO ${process.env.SITE_NAME} APP. Thank you for choosing ${process.env.SITE_NAME} APP.</p>
        <p>Congratulations Your Account has been created successfully</p>
        
        <p style="font-size:0.9em;">Regards,<br />${process.env.SITE_NAME} APP</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>${process.env.SITE_NAME} APP</p>
        </div>
      </div>
    </div>`
    );
    res
      .status(200)
      .json({ message: "OTP verified successfully", token: token });
  } catch (error) {
    console.error("Error during OTP verification:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find();
    res.status(200).json(gallery);
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const addLikeToImage = async (req, res) => {
  try {
    const { imageId } = req.body;
    const user = await User.findById(req.user.userId);
    if (user.gallery_likes.includes(imageId)) {
      return res.status(400).json({ error: "Already liked" });
    }
    user.gallery_likes.push(imageId);
    await user.save();
    res.status(200).json(user.gallery_likes);
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeLikeFromImage = async (req, res) => {
  try {
    const { imageId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.gallery_likes.includes(imageId)) {
      return res.status(400).json({ error: "Not liked" });
    }
    user.gallery_likes = user.gallery_likes.filter(
      (image) => image !== imageId
    );
    await user.save();
    res.status(200).json(user.gallery_likes);
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getGalleryLikes = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const gallery = await Gallery.find();
    const gallery_likes = gallery.filter((image) =>
      user.gallery_likes.includes(image._id)
    );
    res.status(200).json(gallery_likes);
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const resetPassword = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { password } = req.body;

    // Step 2: Validate User Input
    if (!password) {
      return res.status(400).json({ error: "Please provide password." });
    }

    // Step 3: Find User by Email
    const user = await User.findById(req.user.userId);

    // Step 4: Verify User and Password
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Step 5: Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 6: Update password
    user.password = hashedPassword;
    await user.save();

    // Step 7: Send Response
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const forgotPassword = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { email } = req.body;

    // Step 2: Validate User Input
    if (!email) {
      return res.status(400).json({ error: "Please provide email." });
    }

    // Step 3: Find User by Email
    const user = await User.findOne({ email: email });

    // Step 4: Check if the user is already verified
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Step 5: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Step 6: Send OTP to email
    sendMail(
      email,
      "OTP Verification",
      `Your OTP is: ${otp}`,
      `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${process.env.SITE_NAME} APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${user.name},</p>
        <p>We have received a request to reset your password. Use the following OTP to reset your password. OTP is valid for 20 minutes</p>
        <p>Please do not share this OTP with anyone.</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />${process.env.SITE_NAME} APP</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>${process.env.SITE_NAME} APP</p>
        </div>
      </div>
    </div>`
    )
      .then(async (result) => {
        console.log(result);

        // Step 7: Save OTP to the database
        user.forgot_otp = otp;
        await user.save();

        // Step 8: Send Response
        res.status(200).json({ message: "OTP sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.message);
        res.status(400).json({ message: "OTP failed" });
      });
  } catch (error) {
    console.error("Error during OTP generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    // Step 1: Receive User Data
    const { email, otp } = req.body;

    // Step 2: Validate User Input
    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: "Please provide both email and OTP." });
    }

    // Step 3: Find User by Email
    const user = await User.findOne({ email: email });

    // Step 4: Verify User and OTP
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (otp !== user.forgot_otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    // Step 5: Generate JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
       expiresIn: "36500d",
    });
    // Step 5: Send Response
    res.status(200).json({ token: token });
  } catch (error) {
    console.error("Error during OTP verification:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const createIdCard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Get the profile image from the request
    const profileImage = req.file;

    // Create a canvas for the ID card
    const canvas = createCanvas(500, 260);
    //pixel

    const ctx = canvas.getContext("2d");

    // Load and draw the background image
    const backgroundImage = await loadImage(process.env.DOMAIN+'/idcard1.jpg');
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw white background if needed for additional fields
    // ctx.fillStyle = "white";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load the user's profile image
    const image = await loadImage(profileImage.path);
    ctx.drawImage(image, 120, 110, 80, 100);

    // Draw text fields on the canvas
    ctx.font = "12px Arial";
    ctx.fillStyle = "black"; // Text color
    ctx.fillText(`Name: ${user.name}`, 220, 120);
    ctx.fillText(`Email: ${user.email}`, 220, 140);
    ctx.fillText(`Phone: ${user.phoneNumber}`, 220, 160);
      const userDateOfBirth = user.date_of_birth.toString(); // Convert to string if it's a Date object

// Extract only the date part without the time component
const dateObject = new Date(userDateOfBirth);
const formattedDate = dateObject.toDateString();

// Use this `formattedDate` variable in your ctx.fillText for DOB
ctx.fillText(`DOB: ${formattedDate}`, 220, 180);


    // if (user.blood_group) {
    //   ctx.fillText(`Blood Group: ${user.blood_group}`, 220, 200);
    // }
    // Add additional fields like District and Panchayat if they exist in the User model
    if (user.district) {
      ctx.fillText(`District: ${user.district}`, 220, 200);
    }  
    // if (user.union) {
    //   ctx.fillText(`Union: ${user.union}`, 220, 220);
    // }
    // if (user.panchayath) {
    //   ctx.fillText(`Panchayat: ${user.panchayath}`, 220, 240);
    // }

    // Generate QR code with user ID
    const qrCodeDataUrl = await qr.toDataURL(user._id.toString());
    const qrCodeImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrCodeImage, 10, 200, 50, 50); // Adjusted position for QR code

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer();

    // Set the response headers for image download
    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": "attachment; filename=id-card.png",
    });

    // Send the buffer as the response
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error during ID card generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const AddFeedBack = async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    //rating must be between 1 to 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 to 5" });
    }

    const newFeedback = new Feedback({
      feedback: feedback,
      userId: user._id,
      username: user.name,
      email: user.email,
      rating: rating,
    });
    const savedFeedback = await newFeedback.save();
    res.status(200).json(savedFeedback);
  } catch (error) {
    console.error("Error during ID card generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
  console.log(token,"google")
    if (!token) {
      return res.status(400).json({ error: "ID token not provided." });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);

    const authUser = decodedToken;
    const user = await User.findOne({ email: authUser.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const tokenNew = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "36500d",
    });
console.log(tokenNew)
    res
      .status(200)
      .json({ token: tokenNew, user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error("Error during ID card generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const autoLogin = async (req, res) => {
  try {
    // Retrieve userId from request
    const userId = req.user.userId;

    // Find user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch data from the STORE_URL endpoint
    const response = await fetch(
      `${process.env.STORE_URL}/api/user/auto-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password, // Ensure you're not sending the actual password here for security reasons
        }),
      }
    );
      console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch data from STORE_URL");
    }

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }
    // Return the URL and token from the response
    res.status(200).json({ url: data.url, token: data.token });
  } catch (error) {
    console.log(error);
    console.error("Error during autoLogin:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addVote = async (req, res) => {
  try {
    const { optionId, pollId } = req.body;

    // Fetch the poll by its ID
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(400).json({ error: "Poll not found" });
    }

    // Find the option by its ID within the poll's options
    const option = poll.options.find((opt) => opt._id.toString() === optionId); // Convert optionId to string for comparison
    if (!option) {
      return res.status(400).json({ error: "Option not found" });
    }

    // Check if the user has already voted for this option
    if (poll.users.includes(req.user.userId)) {
      return res.status(400).json({ error: "Already voted" });
    }

    // Update the votes count for the selected option and add the user to the list of voters
    option.votes += 1;
    option.users.push(req.user.userId);
    poll.users.push(req.user.userId);

    // Save the updated poll
    await poll.save();

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error during adding vote:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// const emailLogin = async (req, res) => {
//   try {
//     const { email } = req.body;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name: "",
//         email,
//         password: Date.now().toString(),
//         phoneNumber: "",
//         whatsappNumber: "",
//         age: "",
//         date_of_birth: "",
//         block: "",
//         constituency: "",
//         union: "", // Change "Union" to "union" if needed
//         addaar: "",
//         pan_card: "",
//         blood_group: "",
//       });
//     }

//     const token = jwt.sign({ userId: user._id }, jwtSecret, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ token, user: { id: user._id, name: user.name } });
//   } catch (error) {
//     console.error("Error during email login:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const updateProfileImage = async (req, res) => {
  try {
    const profileImage  = req.file;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.profileImage = `${process.env.DOMAIN}/profileImage/${profileImage.filename}`;
    await user.save();
    res.status(200).json({ profileImage });
  } catch (error) {
    console.error("Error during profile image update:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const appleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    console.log(token,"apple")
    if (!token) {
      return res.status(400).json({ error: "ID token not provided." });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(decodedToken)
    const authUser = decodedToken;
    const user = await User.findOne({ email: authUser.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const tokenNew = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "36500d",
    });
    res
      .status(200)
      .json({ token: tokenNew, user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error("Error during ID card generation:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const storeNotificationToken = async (req, res) => {
  try {
  const { FCMToken } = req.body;
  const notification = await Notification.findOne({ token:FCMToken  }); 
  if(!notification){
    const notification = await Notification.create({ token: FCMToken, userId: req.user.userId });
    res.status(200).json({ notification });
  }else{
    res.status(200).json({ notification });
  }
  }catch(error){
    console.error("Error during token store:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const getPaymentDetailsWithDay = async (req, res) => {
  try {
    const { day } = req.params;
    
    // Calculate the start date based on the provided day count
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - day);

    // Convert startDate to the desired format
    const formattedStartDate = startDate.toLocaleDateString();

    // Query payments with a date greater than or equal to the formatted start date
    const payments = await Payment.find({ date: { $gte: formattedStartDate } });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const registerAsVolunteer = async (req, res) => {
  try {
   const  {wardNo,booth,aadhaarNo,madalamPresident,address,mandalamMember,district,constituency,assembly,boothRule} = req.body;
    const imageObjs = req.files;
    if( !booth ||  !district || !constituency || !assembly){
      return res.status(400).json({ error: "Please provide all details" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const images = [];
    if(imageObjs){

      for (let i = 0; i < imageObjs.length; i++) {
        images.push(`${process.env.DOMAIN}/aadhaarImage/${imageObjs[i].filename}`);
      }
    }
    //if details added
    user.volunteer = {
      wardNo: wardNo || "",
      booth,
      district,
      constituency,
      assembly,
      aadhaarNo: aadhaarNo || "",
      madalamPresident:madalamPresident || "",
      address:address || "",
      name: user.name,
      phone: user.phoneNumber,
      email: user.email,
      aadhaar:images,
      mandalamMember: mandalamMember || "",
      boothRule:boothRule || [],

    }
    const token = jwt.sign({ userId: user._id }, process.env.VOLUNTEER_SERVER_SECRET, {
      expiresIn: "36500d",
    })
    axios.post(`${process.env.VOLUNTEER_URL}/api/volunteer/register-from-app`, {
        ...user.volunteer,
        dccappuserId: user._id,
        password: user.password,
        dccappurl:process.env.DOMAIN
    },{
      headers: {
        "x-access-token": token
      }
    }).then((res) => {
      user.volunteer.volunteerId = res.data._id;
      user.volunteer.applied = true;

      user.save()
    })
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error during registration as volunteer:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const verifyVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.volunteer.applied = true;
    user.volunteer.status = true;
    user.save();
    
  }catch(error){
    console.error("Error during registration as volunteer:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const disQualifyVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.volunteer.applied = false;
    user.volunteer.status = false;
    user.save();
      res.status(200).json({ message: "Disqualified Successfully" });
  }
  catch(error){
    console.error("Error during registration as volunteer:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  register,
  login,
  protected,
  details,
  update,
  deleteUser,
  getGallery,
  sendOTP,
  verifyOTP,
  addLikeToImage,
  removeLikeFromImage,
  getGalleryLikes,
  resetPassword,
  forgotPassword,
  verifyForgotPasswordOTP,
  createIdCard,
  AddFeedBack,
  googleLogin,
  autoLogin,
  addVote,
  updateProfileImage,
  appleLogin,
  storeNotificationToken,
  getPaymentDetailsWithDay,
  registerAsVolunteer,
  verifyVolunteer,
  disQualifyVolunteer
};
