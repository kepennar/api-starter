import { path as appRootPath } from "app-root-path";
import { join } from "path";
import mjml from "mjml";
import { readFileSync } from "fs";

export function compileMailTemplate(templateName: string): string {
  const template = readFileSync(
    join(appRootPath, `api/mjml-template/${templateName}`),
    {
      encoding: "utf-8",
    }
  );
  return mjml(template).html;
}
