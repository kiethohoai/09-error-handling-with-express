const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1. Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2. Email options
  const mailOptions = {
    from: 'John Ho <johnho@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // 3. Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
