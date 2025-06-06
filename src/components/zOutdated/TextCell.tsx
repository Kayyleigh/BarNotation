import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

type TextCellProps = {
  value: string;
  isPreviewMode: boolean;
  onChange: (newValue: string) => void;
  onDelete: () => void;
  placeholder?: string;
};

const TextCell: React.FC<TextCellProps> = ({
  value,
  isPreviewMode,
  onChange,
  onDelete,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Resize immediately when value changes (external or internal)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div
      className={clsx("cell", "text-cell", { preview: isPreviewMode })}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {showToolbar && (
        <div className="cell-toolbar">
          <button className="delete-button" onClick={onDelete}>
            🗑️
          </button>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          onChange(val);
        }}
        placeholder={placeholder}
        className={clsx("text-cell-input", { preview: isPreviewMode })}
        rows={1}
      />
    </div>
  );
};

export default TextCell;
