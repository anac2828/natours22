import nodemailer from 'nodemailer';

const sendEmail = (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Mail options
  const options = {
    from: 'Ana Cervantes <admin@jonas-3.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send email with transporter
  transporter.sendEmail();
};

export default sendEmail;
