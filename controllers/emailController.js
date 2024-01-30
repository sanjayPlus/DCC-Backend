const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function sendMail(to, subject, text, html) {
//   try {
//     const transport = nodemailer.createTransport({
//       host: process.env.MAIL_HOST, // Replace with your SMTP server host
//       port: process.env.MAIL_PORT, // Replace with your SMTP port
//       secure: false, // Set this to false when using STARTTLS with TLS
//       auth: {
//         user: process.env.SMAIL, // Your email address
//         pass: process.env.MAIL_PASSWORD, // Your email password or app-specific password
//       },
//       requireTLS: true, // Enforces using TLS
//       tls: {
//         // Allowing self-signed certificates if necessary (use with caution)
//         rejectUnauthorized: false, // Set to true to enforce certificate validation
//       },
//     });

//     const mailOptions = {
//       from:`DCC Thrissur <${process.env.SMAIL}>`, // Sender address
//       to, // Recipient
//       subject,
//       text,
//       html: `
//       <html>
//       <head>
//         <style>
//           .container {
//             width: 100%;
//             height: max-content;
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           }
//           .card {
//             display: grid;
           
//           }
//           .card button{
//             padding: 10px 25px;
//             border: none;
//             border-radius: 15px;
//             background-color: rgb(12, 47, 145);
//             color: aliceblue;
//             box-shadow: 2px 2px 15px rgba(107, 95, 95, 0.334);
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//        ${html}
//         </div>
//       </body>
//     </html>
    
//       `,
//     };

//     const result = await transport.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     return error;
//   }
// }
async function sendMail(to, subject, text, html) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `DCC Thrissur <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      html: `
      <html>
      <head>
        <style>
          .container {
            width: 100%;
            height: max-content;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .card {
            display: grid;
           
          }
          .card button{
            padding: 10px 25px;
            border: none;
            border-radius: 15px;
            background-color: rgb(12, 47, 145);
            color: aliceblue;
            box-shadow: 2px 2px 15px rgba(107, 95, 95, 0.334);
          }
        </style>
      </head>
      <body>
        <div class="container">
       ${html}
        </div>
      </body>
    </html>
    
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}
// sendMail('sanjaysanthosh919@gmail.com', 'Hello from gmail', 'Hello from gmail', '<h1>Hello from gmail</h1>')
//   .then((result) => console.log('Email sent...', result))
//   .catch((error) => console.log(error.message));

function generateOTP(length) {
  const chars = "0123456789"; // Characters allowed in the OTP
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    otp += chars[randomIndex];
  }

  return otp;
}

function generateRandomCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

module.exports = { sendMail, generateOTP, generateRandomCode };
