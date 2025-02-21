import nodemailer from 'nodemailer';
import config from '../config';
import { CustomError } from '../middlewares';
import { StatusCodes } from 'http-status-codes';

const { app, mail } = config;

interface MailDto {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

const sendMail = async (data: MailDto): Promise<void> => {
  const transporter = nodemailer.createTransport({
    port: Number(mail.port),
    host: mail.host,
    auth: {
      user: mail.user,
      pass: mail.pass,
    },
  });

  try {
    const res = await transporter.sendMail({
      from: `Harmoney <${mail.user}>`,
      ...data,
    });
    console.log('Mail sent:', res.messageId);
  } catch (err) {
    console.error('Failed to send email:', err);
    throw new CustomError('Failed to send email.', StatusCodes.BAD_GATEWAY);
  }
};

export const sendNewUserVerificationMail = async (to: string, otp: string) => {
  const mail = {
    to,
    subject: `${app.name} Account Verification`,
    text: `Complete your registration by using this code to verify your email: ${otp}`,
    html: `<h3>Complete your registration by using this code to verify your account: ${otp}</h3>`,
  };

  await sendMail(mail);
};

export const sendAccountVerifiedMail = async (to: string) => {
  const mail = {
    to,
    subject: `Welcome on board ${app.name}`,
    text: `Your account on ${app.name} have been verified.`,
    html: `<h3>Your account on ${app.name} have been verified.</h3>`,
  };

  await sendMail(mail);
};

export const sendPasswordResetMail = async (to: string, otp: string) => {
  const mail = {
    to,
    subject: `${app.name} Password Reset`,
    text: `Your password reset pin is: ${otp}`,
    html: `<h3>Your password reset pin is: ${otp}</h3>`,
  };

  await sendMail(mail);
};
