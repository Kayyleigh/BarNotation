import React, { useEffect, useRef } from "react";

type TextCellProps = {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
};

const TextCell: React.FC<TextCellProps> = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height when value changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height to measure scrollHeight
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="text-cell">
      <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "1em",
        width: "100%",
        resize: "none",
        overflow: "hidden",
        fontSize: "1rem",
        fontFamily: "inherit",
        border: "1px solid var(--math-editor-border)",
        borderRadius: "6px",
        boxShadow: "0 0 4px var(--math-editor-shadow)",
        boxSizing: "border-box",
        backgroundColor: "inherit",
        color: "var(--main-text-color, inherit)",
        background: "var(--math-editor-bg)",
      }}
      rows={1}
    />
    </div>
  );
};

export default TextCell;
