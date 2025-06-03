import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

type TextCellProps = {
  value: string;
  isPreviewMode: boolean;
  onChange: (newValue: string) => void;
  onDelete: () => void;
  placeholder?: string;
};

const TextCell: React.FC<TextCellProps> = ({ value, isPreviewMode, onChange, onDelete, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showToolbar, setShowToolbar] = useState(false);

  // Auto-resize textarea height when value changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height to measure scrollHeight
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div
    className={clsx("cell", "text-cell", { preview: isPreviewMode })}
    onMouseEnter={() => setShowToolbar(true)}
    onMouseLeave={() => setShowToolbar(false)}
    >
      {showToolbar && (
        <div className="cell-toolbar">
          <button className="delete-button" onClick={onDelete}>🗑️</button>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-cell-input"
        rows={1}
      />
    </div>
  );
};

export default TextCell;
