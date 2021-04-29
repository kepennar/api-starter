import nodemailer from "nodemailer";
import { logger } from "../logger";
import { config } from "../config";

const appConfig = config.get("app");
const mailConfig = config.get("mail");

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: appConfig.env === "DEV" ? false : true,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password,
  },
});

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}
export async function sendMail({ from, to, subject, html }: SendMailOptions) {
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
  logger.info(`Mail "${subject} send`, info.messageId);
}
