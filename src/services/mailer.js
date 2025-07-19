require('dotenv').config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOTPEmail(to, otp,name) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9; color: #333;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://yt3.googleusercontent.com/2n1mMw31wtZbE1ri4audS-SG9sMs0jY8vEJ4Sx9CFXTkkW3V5hmJl4xACqgsgfCw-nzOPYvE4Q=s160-c-k-c0x00ffffff-no-rj" alt="Matbakh Bayti" style="width: 60px; height: 60px; border-radius: 50%;" />
        <h2 style="margin: 10px 0; color: #e09100;">Matbakh Bayti</h2>
      </div>
      <h3 style="color: #333;">OTP Verification</h3>
      <p>Dear ${name},</p>
      <p>Thank you for signing up. To complete your verification, please use the following OTP:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; background-color: #fff3cd; padding: 10px 20px; border-radius: 6px; color: #856404; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for the next 10 minutes. Please do not share this with anyone.</p>
      <p>Thanks & Regards,<br><strong>Matbakh Bayti Team</strong></p>
      <hr style="margin-top: 30px;" />
      <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Matbakh Bayti" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Matbakh Bayti OTP Code',
    html: emailContent
  });
}

module.exports = sendOTPEmail;
