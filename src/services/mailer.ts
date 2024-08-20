import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import config from '../config';

const { mailgun } = config;

export interface MailgunData {
  to: string | Array<string>;
  subject: string;
  text: string;
  html: string;
}

const sendMail = async (data: MailgunData): Promise<void> => {
  try {
    const MAILGUN = new Mailgun(FormData);

    const mg = MAILGUN.client({
      username: 'api',
      key: mailgun.key,
    });

    const res = await mg.messages.create(mailgun.domain, {
      from: mailgun.sender,
      ...data,
    });

    console.log('mail sent: %s', JSON.stringify(res.id));
  } catch (error) {
    console.log(error);
  }
};

export const sendNewUserVerificationMail = async (to: string, otp: string) => {
  const mail = {
    to,
    subject: `${process.env.APP_NAME} Account Verification`,
    text: `Complete your registration by using this code to verify your email: ${otp}`,
    html: `<h3>Complete your registration by using this code to verify your account: ${otp}</h3>`,
  };

  await sendMail(mail);
};

export const sendAccountVerifiedMail = async (to: string) => {
  const mail = {
    to,
    subject: `Welcome on board ${process.env.APP_NAME}`,
    text: `Your account on ${process.env.APP_NAME} have been verified.`,
    html: `<h3>Your account on ${process.env.APP_NAME} have been verified.</h3>`,
  };

  await sendMail(mail);
};

export const sendPasswordResetMail = async (to: string, otp: string) => {
  const mail = {
    to,
    subject: `${process.env.APP_NAME} Password Reset`,
    text: `Your password reset pin is: ${otp}`,
    html: `<h3>Your password reset pin is: ${otp}</h3>`,
  };

  await sendMail(mail);
};

export const sendUserAccountDeletedMail = async (to: string) => {
  const mail = {
    to,
    subject: `You said goodbye!`,
    text: `You requested to permanently delete your account from ${process.env.APP_NAME}. This request may take up to 5mins to 2days to complete propagation across all our services.`,
    html: `<p>You requested to permanently delete your account from ${process.env.APP_NAME}. This request may take up to 5mins to 2days to complete propagation across all our services.</p>`,
  };

  await sendMail(mail);
};
