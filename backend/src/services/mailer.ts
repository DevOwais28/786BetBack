import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLoginNotification = async (email: string, ip: string) => {
  await transporter.sendMail({
    to: email,
    subject: 'Login Alert – 786Bet',
    html: `A new login was detected from IP <b>${ip}</b>.<br>If this wasn’t you, contact support immediately.`,
  });
};