import path from 'path';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';

const __dirname = path.resolve();

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ana Cervantes ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    // user SendGrid in PROD mode
    if (process.env.NODE_ENV === 'production') {
      // const sgOptions = {
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },

      // return nodemailer.createTransport(sgTransport(sgOptions));

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // user nodemailer in DEV mode
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in gmail 'less secure app' aption
    });
  }

  async send(template, subject) {
    //Render HMTL based on a pug template
    // dirname - location of the currently running script (natours22 folder)
    //renderFile(template, data for personalization)
    console.log(`${__dirname}`);
    const html = pug.renderFile(`${__dirname}/views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      // template
      html,
      // convert html to text
      text: htmlToText(html),
    };
    console.log(mailOptions.to);
    // Create a transprot and send email. The newTransport will be created either with nodemailer or SendGrid
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}

// const sendEmail = catchAsync(async (options) => {
// Create a transporter
// const transporter = nodemailer.createTransport({
//   // service: 'Gmail',
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   // Activate in gmail 'less secure app' aption
// });

// Define the email options
// const mailOptions = {
//   from: 'Jonas Schmedtmann <hello@jonas.io',
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
// };

// Actually send the email
// transporter will return a promise
//   await transporter.sendMail(mailOptions);
// });

// export default sendEmail;
