import { User } from "@agado/model";
import { compile } from "handlebars";
import { sendMail } from "./mail.sender";
import { compileMailTemplate } from "./mjml.compiler";
import { config } from "../config";

const appConfig = config.get("app");
const mailConfig = config.get("mail");

const welcomeTemplate = compileMailTemplate("welcome.mjml");

interface WelcomeMailContext extends User.User {
  token: string;
}
export async function sendWelcomeMail(context: WelcomeMailContext) {
  const activateUrl = `${appConfig.activationPage}?token=${context.token}`;
  const html = compile(welcomeTemplate)({ ...context, activateUrl });
  await sendMail({
    from: mailConfig.from,
    to: context.email,
    subject: "Welcome",
    html,
  });
}
