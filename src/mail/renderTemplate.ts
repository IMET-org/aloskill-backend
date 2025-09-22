// src/mail/renderTemplate.ts
import { render } from "@react-email/render";
import * as React from "react";

// Import all templates
import ResetPassword, { ResetPasswordProps } from "./templates/ResetPassword";

// Template map (extendable later)
type TemplateMap = {
  resetPassword: {
    component: React.FC<ResetPasswordProps>;
    props: ResetPasswordProps;
  };
};

// actual template mapping
const templates: Record<keyof TemplateMap, React.FC<any>> = {
  resetPassword: ResetPassword,
};

// render function
export async function renderTemplate<K extends keyof TemplateMap>(
  name: K,
  props: TemplateMap[K]["props"]
): Promise<string> {
  const Template = templates[name];
  const html = render(<Template {...props} />, { pretty: true });
  return html;
}
