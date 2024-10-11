// import Mailgun from 'mailgun.js';
// import FormData from 'form-data';
import nodemailer from 'nodemailer';
import config from '../config';
import { CustomError, ErrorMiddleware } from '../middlewares';
import { StatusCodes } from 'http-status-codes';

const { app, mailgun, mail } = config;

interface MailDto {
  to: string | Array<string>;
  subject: string;
  text: string;
  html: string;
}

// const sendMail = async (data: MailDto): Promise<void> => {
//   try {
//     const MAILGUN = new Mailgun(FormData);

//     const mg = MAILGUN.client({
//       username: 'api',
//       key: mailgun.key,
//     });

//     const res = await mg.messages.create(mailgun.domain, {
//       from: mailgun.sender,
//       ...data,
//     });

//     console.log('mail sent: %s', JSON.stringify(res.id));
//   } catch (error) {
//     console.log(error);
//   }
// };

const sendMail = async (data: MailDto): Promise<void> => {
  const transporter = nodemailer.createTransport({
    port: Number(mail.port),
    host: mail.host,
    auth: {
      user: mail.user,
      pass: mail.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.sendMail(
      { from: `ZippyPay <${mail.user}>`, ...data },
      (err: any, res: any) => {
        if (err) {
          // TODO: let admin no that email sending fails
          // throw new CustomError(
          //   'Failed to send email.',
          //   StatusCodes.BAD_GATEWAY,
          // );
        } else {
          console.log('mail sent: %s', res.messageId);
          return true;
        }
      },
    );
  } catch (error) {
    // console.log(error);
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

export const sendUserAccountDeletedMail = async (to: string) => {
  const mail = {
    to,
    subject: `You said goodbye!`,
    text: `You requested to permanently delete your account from ${app.name}. This request may take up to 5mins to 2days to complete propagation across all our services.`,
    html: `<p>You requested to permanently delete your account from ${app.name}. This request may take up to 5mins to 2days to complete propagation across all our services.</p>`,
  };

  await sendMail(mail);
};

export const sendCreditAlertMail = async (
  to: string,
  name: string,
  sourceName: string,
  amount: number,
) => {
  const mail = {
    to,
    subject: `Transaction Received`,
    text: `Hello ${name}, Your account have been funded by ${sourceName} with a total sum of ${amount}.`,
    html: `<p>Hello ${name}, Your account have been funded by ${sourceName} with a total sum of ${amount}.</p>`,
  };

  await sendMail(mail);
};

export const sendDebitAlertMail = async (
  to: string,
  name: string,
  amount: number,
) => {
  const mail = {
    to,
    subject: `Transaction Successful`,
    text: `Hello ${name}, Your account have been debited a sum of ${amount}.`,
    html: `<p>Hello ${name}, Your account have been debited a sum of ${amount}.</p>`,
  };

  await sendMail(mail);
};
