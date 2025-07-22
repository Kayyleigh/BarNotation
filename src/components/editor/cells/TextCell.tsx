// components/editor/cells/TextCell.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import clsx from "clsx";
import styles from "./cell.module.css";
import textStyles from "../../../styles/textStyles.module.css";
import type { TextCellContent } from "../../../models/noteTypes";
import { useEditorMode } from "../../../hooks/useEditorMode";

type TextCellProps = {
  value: TextCellContent;
  onChange: (update: Partial<TextCellContent>) => void;
  displayNumber: string | null;
};

const TextCell: React.FC<TextCellProps> = ({ value, onChange, displayNumber }) => {
  const { mode } = useEditorMode();
  const isEditMode = mode === "edit";
  const isLockedMode = mode === "locked";

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState(value.text);
  const prevValueTextRef = useRef(value.text);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
  
    const resize = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
  
    resize(); // initial call
  
    const observer = new ResizeObserver(resize);
    observer.observe(el);
  
    // Also observe parent if width affects wrapping
    const parent = el.parentElement;
    if (parent) observer.observe(parent);
  
    return () => observer.disconnect();
  }, []);  

  // Sync inputValue from external text changes only (not local edits)
  useEffect(() => {
    if (value.text !== prevValueTextRef.current) {
      setInputValue(value.text);
      prevValueTextRef.current = value.text;
    }
  }, [value.text]);

  // Auto-resize textarea height when input changes
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleBlur = useCallback(() => {
    if (inputValue !== value.text) {
      onChange({ text: inputValue }); // partial update
    }
  }, [inputValue, value.text, onChange]);

  const textareaClass = useMemo(
    () =>
      clsx(
        { [styles.preview]: !isEditMode },
        textStyles[value.type]
      ),
    [isEditMode, value.type]
  );

  return (
    <div className={styles.textCellWrapper}>
      {displayNumber && (
        <div className={clsx(styles.displayNumber, textareaClass)}>
          {displayNumber}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        spellCheck={isEditMode}
        className={clsx(styles.textCellInput, textareaClass)}
        rows={1}
        style={{ height: "auto", overflow: "hidden" }}
        disabled={isLockedMode}
      />
    </div>
  );
};

export default React.memo(TextCell);
