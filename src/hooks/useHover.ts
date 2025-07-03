import { useContext } from "react";
import { HoverContext } from "./HoverContext";

export function useHover() {
  const context = useContext(HoverContext);
  if (!context) {
    throw new Error("useHover must be used within a HoverProvider");
  }
  return context; // returns { hoverPath, setHoverPath }
}
