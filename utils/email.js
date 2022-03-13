import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.js';

const sendEmail = catchAsync(async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail 'less secure app' aption
  });

  // Define the email options
  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actually send the email
  // transporter will return a promise
  await transporter.sendMail(mailOptions);
});

export default sendEmail;
