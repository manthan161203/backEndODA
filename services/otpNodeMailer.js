const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendOTPViaEmail = async (to, subject, text, htmlTemplate) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_FOR_OTP,
        pass: process.env.PASS_FOR_OTP,
      },
    });
    if (htmlTemplate != null) {
      const mailOptions = {
        from: '"Eazy Heathcare" <eazyHeathCare@gmail.com>',
        to,
        subject,
        text,
        html:htmlTemplate
      };
      console.log("hey")
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.messageId);
      return info.messageId;
    } else {
      const mailOptions = {
        from: '"Eazy Heathcare" <eazyHeathCare@gmail.com>',
        to,
        subject,
        text,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.messageId);
      return info.messageId;
    }

    
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendOTPViaEmail;
