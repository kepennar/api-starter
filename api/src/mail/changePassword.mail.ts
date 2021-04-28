import { User } from "@agado/model";
import { compile } from "handlebars";
import { sendMail } from "./mail.sender";
import { compileMailTemplate } from "./mjml.compiler";
import { config } from "../config";

const appConfig = config.get("app");
const mailConfig = config.get("mail");

const changePasswordTemplate = compileMailTemplate("change-pasword.mjml");

interface ChangePasswordContext extends User.User {
  token: string;
}
export async function changePasswordMail(context: ChangePasswordContext) {
  const changePasswordUrl = `${appConfig.changePasswordPage}?token=${context.token}`;
  const html = compile(changePasswordTemplate)({
    ...context,
    changePasswordUrl,
  });
  await sendMail({
    from: mailConfig.from,
    to: context.email,
    subject: "Changer votre mot de passe",
    html,
  });
}
