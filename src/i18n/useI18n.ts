import { useContext } from "react";
import { I18nContext } from "./I18nContext";

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
};
