var nodemailer = require('nodemailer');


exports.smtpTransport = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASS
    }
});
