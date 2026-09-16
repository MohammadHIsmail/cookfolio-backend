const nodemailer = require('nodemailer');
const config = require('../../config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: { user: config.smtp.user, pass: config.smtp.password },
});

async function sendOtp(to, name, code, ttlMinutes) {
  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Your verification code',
    text: `Hi ${name},\n\nYour verification code is ${code}.\nIt expires in ${ttlMinutes} minutes.\n\nIf you didn't request this, ignore this email.`,
  });
}

module.exports = { sendOtp };