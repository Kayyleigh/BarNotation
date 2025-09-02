import { useContext } from "react";
import { CustomCommandContext, type CustomCommandContextType } from "./customCommandContext";

export const useCustomCommands = (): CustomCommandContextType => {
  const ctx = useContext(CustomCommandContext);
  if (!ctx) throw new Error("useCustomCommandContext must be used within a CustomCommandProvider");
  return ctx;
};
