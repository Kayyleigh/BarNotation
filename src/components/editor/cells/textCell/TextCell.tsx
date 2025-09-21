// components/editor/cells/textCell/TextCell.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import styles from "../cell.module.css";
import textStyles from "../../../../styles/textStyles.module.css";
import type { TextCellContent } from "../../../../models/noteTypes";
import type { BaseCellProps } from "../../../../models/cellRegistry";
import { useEditorMode } from "../../../../hooks/editorMode/useEditorMode";

export interface TextCellHandle {
  focusAndScroll: () => void;
}

const TextCell = forwardRef<
  TextCellHandle,
  BaseCellProps<TextCellContent> & { displayNumber?: string }
>(({ content, onChange, displayNumber }, ref) => {
  const { editingMode } = useEditorMode();
  const isEditMode = editingMode === "edit";

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState(content.text);
  const prevValueTextRef = useRef(content.text);

  // Expose focusAndScroll
  useImperativeHandle(ref, () => ({
    focusAndScroll: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    },
  }));

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const resize = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (content.text !== prevValueTextRef.current) {
      setInputValue(content.text);
      prevValueTextRef.current = content.text;
    }
  }, [content.text]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
    []
  );

  const handleBlur = useCallback(() => {
    if (inputValue !== content.text) {
      onChange({ ...content, text: inputValue });
    }
  }, [inputValue, content, onChange]);

  const textareaClass = useMemo(
    () => clsx({ [styles.preview]: !isEditMode }, textStyles[content.type]),
    [isEditMode, content.type]
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
      />
    </div>
  );
});

TextCell.displayName = "TextCell";
export default React.memo(TextCell);
