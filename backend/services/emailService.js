const nodemailer = require('nodemailer');
const {
  getVerificationEmailHTML,
  getOrderConfirmationHTML,
} = require('../utils/emailTemplates');

let transporter;

const initializeTransporter = () => {
  if (transporter) {
    return;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('Email service configured successfully.');
  } else {
    console.warn(
      'Email service credentials (EMAIL_USER, EMAIL_PASS) are not set. Emails will not be sent.'
    );
    transporter = null;
  }
};

initializeTransporter();

const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.error('Email service is not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"ResellBay" <${process.env.EMAIL_USER}>`,
      ...mailOptions,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to ResellBay! Please Verify Your Email',
    html: getVerificationEmailHTML(user, verificationUrl),
  });
};

const sendOrderConfirmationEmail = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Your ResellBay Order #${order._id} is Confirmed!`,
    html: getOrderConfirmationHTML(user, order),
  });
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
};
