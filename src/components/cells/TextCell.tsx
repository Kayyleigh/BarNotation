import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type TextCellProps = {
  value: string;
  isPreviewMode: boolean;
  onChange: (value: string) => void;
};

const TextCell: React.FC<TextCellProps> = ({
  value,
  isPreviewMode,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setInputValue(value), [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <textarea
      ref={textareaRef}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
      }}
      className={clsx("text-cell-input", { preview: isPreviewMode })}
      rows={1}
    />
  );
};

export default TextCell;
