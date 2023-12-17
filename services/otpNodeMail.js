const nodemailer = require('nodemailer');

const sendOTPViaEmail = async (to, subject, text) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Your Gmail email address
        pass: 'your-gmail-password' // Your Gmail password
      }
    });

    // Setup email data
    const mailOptions = {
      from: 'your-email@gmail.com', // Sender address
      to, // Receiver address
      subject, // Subject
      text // Text body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);

    return info.messageId;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendOTPViaEmail;
