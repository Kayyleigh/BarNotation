import { TextStyle } from "../../../models/mathNodeTypes";
import clsx from "clsx";

export function getStyleClass(style: TextStyle) {
  return clsx({
    "math-style-normal": style.fontStyling?.fontStyle === "normal",
    "math-style-upright": style.fontStyling?.fontStyle === "upright",
    "math-style-bold": style.fontStyling?.fontStyle === "bold",
    "math-style-calligraphic": style.fontStyling?.fontStyle === "calligraphic",
    "math-style-blackboard": style.fontStyling?.fontStyle === "blackboard",
    "math-style-command": style.fontStyling?.fontStyle === "command",
    "math-style-multidigit": style.fontStyling?.fontStyle === "multidigit",
  });
}

export function getInlineStyle(style: TextStyle): React.CSSProperties {
  return {
    color: style.color,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
  };
}
