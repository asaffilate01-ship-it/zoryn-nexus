import { deMarketing } from "./de.marketing";
import { dePortal } from "./de.portal";
import { deModules } from "./de.modules";
import { deProvider } from "./de.provider";
import { deAuth } from "./de.auth";

export const de: Record<string, string> = {
  ...deMarketing,
  ...dePortal,
  ...deModules,
  ...deProvider,
  ...deAuth,
};