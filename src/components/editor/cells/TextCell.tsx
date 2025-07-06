// import React, { useEffect, useRef, useState } from "react";
// import clsx from "clsx";

// type TextCellProps = {
//   value: string;
//   isPreviewMode: boolean;
//   onChange: (value: string) => void;
// };

// const TextCell: React.FC<TextCellProps> = ({
//   value,
//   isPreviewMode,
//   onChange,
// }) => {
//   const [inputValue, setInputValue] = useState(value);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => setInputValue(value), [value]);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [inputValue]);

//   return (
//     <textarea
//       ref={textareaRef}
//       value={inputValue}
//       spellCheck={`${isPreviewMode ? false : true}`}
//       onChange={(e) => {
//         setInputValue(e.target.value);
//         onChange(e.target.value);
//       }}
//       className={clsx("text-cell-input", { preview: isPreviewMode })}
//       rows={1}
//     />
//   );
// };

// export default React.memo(TextCell);

// components/cells/TextCell.tsx
// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import clsx from "clsx";
// import styles from "./cell.module.css";
// import type { TextCellContent } from "../../models/noteTypes";

// type TextCellProps = {
//   value: TextCellContent;
//   isPreviewMode: boolean;
//   onChange: (value: TextCellContent) => void;
// };

// const TextCell: React.FC<TextCellProps> = ({ value, isPreviewMode, onChange }) => {
//   const [inputValue, setInputValue] = useState(value.text);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const cursorPosRef = useRef<number | null>(null);
//   const inputValueRef = useRef(inputValue);

//   // Update inputValueRef to always reflect latest state
//   useEffect(() => {
//     inputValueRef.current = inputValue;
//   }, [inputValue]);

//   // Log renders
//   console.log("[Render] inputValue:", inputValue, "value.text:", value.text);

//   // Handle value.text changes from parent
//   useEffect(() => {
//     console.log("[useEffect:value.text] value.text changed:", value.text);
//     console.log("[useEffect:value.text] inputValueRef.current:", inputValueRef.current);

//     if (value.text !== inputValueRef.current) {
//       console.log("[useEffect:value.text] Updating inputValue to:", value.text);
//       inputValueRef.current = value.text;
//       setInputValue(value.text);
//     }
//   }, [value.text]);

//   // Auto-resize textarea and restore cursor
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

//       if (cursorPosRef.current !== null) {
//         textareaRef.current.selectionStart = cursorPosRef.current;
//         textareaRef.current.selectionEnd = cursorPosRef.current;
//         console.log("[useEffect:inputValue] Restored cursor at:", cursorPosRef.current);
//         cursorPosRef.current = null;
//       }
//     }
//   }, [inputValue]);

//   // Handle text input
//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newText = e.target.value;
//     const selectionStart = e.target.selectionStart;
//     cursorPosRef.current = selectionStart;

//     console.log("[handleTextChange] User typed:", newText);
//     console.log("[handleTextChange] Cursor at:", selectionStart);

//     setInputValue(newText);

//     const nextValue = { ...value, text: newText };
//     console.log("[handleTextChange] Calling onChange with:", nextValue);
//     onChange(nextValue);
//   };

//   useLayoutEffect(() => {
//     if (textareaRef.current && cursorPosRef.current !== null) {
//       textareaRef.current.selectionStart = cursorPosRef.current;
//       textareaRef.current.selectionEnd = cursorPosRef.current;
//       console.log("[useLayoutEffect] Restoring cursor:", cursorPosRef.current);
//     }
//     cursorPosRef.current = null;
//   }, [inputValue]);

//   return (
//     <textarea
//       ref={textareaRef}
//       value={inputValue}
//       spellCheck={!isPreviewMode}
//       onChange={handleTextChange}
//       className={clsx(
//         styles["text-cell-input"],
//         { [styles.preview]: isPreviewMode },
//         styles[value.type]
//       )}
//       rows={1}
//     />
//   );
// };

// export default React.memo(TextCell);

// components/cells/TextCell.tsx
// import React, {
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import clsx from "clsx";
// import styles from "./cell.module.css";
// import type { TextCellContent } from "../../../models/noteTypes";

// type TextCellProps = {
//   value: TextCellContent;
//   // isPreviewMode: boolean;
//   onChange: (value: TextCellContent) => void;
// };

// const debounce = (fn: () => void, delay: number) => {
//   let timer: ReturnType<typeof setTimeout>;
//   return () => {
//     clearTimeout(timer);
//     timer = setTimeout(fn, delay);
//   };
// };

// const TextCell: React.FC<TextCellProps> = ({ value, onChange }) => {
//   console.warn(`Rendering TextCell with ${value.text} (${value.type})`);
//   const [inputValue, setInputValue] = useState(value.text);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const inputValueRef = useRef(inputValue);
//   const cursorPosRef = useRef<number | null>(null);

//   // Keep a synced ref of inputValue
//   useEffect(() => {
//     inputValueRef.current = inputValue;
//   }, [inputValue]);

//   // Sync local state if value.text updates externally
//   useEffect(() => {
//     if (value.text !== inputValueRef.current) {
//       inputValueRef.current = value.text;
//       setInputValue(value.text);
//     }
//   }, [value.text]);

//   // Resize textarea height
//   const resizeTextarea = useCallback(() => {
//     const el = textareaRef.current;
//     if (el) {
//       el.style.height = "auto"; // Reset to calculate correct scrollHeight
//       el.style.height = `${el.scrollHeight}px`;
//     }
//   }, []);

//   // Debounced resize function to avoid excessive calls on input event
//   const debouncedResize = useRef(
//     debounce(() => {
//       resizeTextarea();
//     }, 50)
//   ).current;

//   // On every input, resize textarea
//   const handleInput = useCallback(() => {
//     debouncedResize();
//   }, [debouncedResize]);

//   // On change updates inputValue and calls onChange prop
//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       const newText = e.target.value;
//       cursorPosRef.current = e.target.selectionStart;

//       setInputValue(newText);
//       onChange({ ...value, text: newText });
//     },
//     [onChange, value]
//   );

//   // useLayoutEffect to resize textarea and restore cursor position after render
//   useLayoutEffect(() => {
//     resizeTextarea();

//     const el = textareaRef.current;
//     if (el && cursorPosRef.current !== null) {
//       el.selectionStart = cursorPosRef.current;
//       el.selectionEnd = cursorPosRef.current;
//     }
//     cursorPosRef.current = null;
//   }, [inputValue, resizeTextarea]);

//   return (
//     <textarea
//       ref={textareaRef}
//       value={inputValue}
//       spellCheck={!isPreviewMode}
//       onChange={handleChange}
//       onInput={handleInput}
//       className={clsx(
//         styles["text-cell-input"],
//         { [styles.preview]: isPreviewMode },
//         styles[value.type] // Style by text type, e.g., 'section', 'plain', etc.
//       )}
//       rows={1}
//       style={{ height: "auto", overflow: "hidden" }} // Hide scrollbar, allow auto height
//       disabled={isPreviewMode}
//     />
//   );
// };

// export default React.memo(TextCell);


// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import clsx from "clsx";
// import styles from "./cell.module.css";
// import type { TextCellContent } from "../../../models/noteTypes";

// type TextCellProps = {
//   value: TextCellContent;
//   onChange: (value: TextCellContent) => void;
// };

// const DEBOUNCE_RESIZE_DELAY = 1500; // 1.5 seconds delay for resize debounce

// const TextCell: React.FC<TextCellProps> = ({ value, onChange }) => {
//   const { mode } = useEditorMode();
//   const isEditMode = mode === "edit";
//   const isLockedMode = mode === "locked";

//   const [inputValue, setInputValue] = useState(value.text);

//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const inputValueRef = useRef(inputValue);
//   const cursorPosRef = useRef<number | null>(null);

//   // Flag to prevent unnecessary resets when local changes are in progress
//   const syncingFromPropRef = useRef(false);

//   // Update ref for current inputValue on every local change
//   useEffect(() => {
//     inputValueRef.current = inputValue;
//   }, [inputValue]);

//   // Sync local inputValue only if external value.text changed and NOT during local edits
//   useEffect(() => {
//     if (value.text !== inputValueRef.current && !syncingFromPropRef.current) {
//       setInputValue(value.text);
//       inputValueRef.current = value.text;
//       // Reset cursor position to end of new value on external sync
//       cursorPosRef.current = value.text.length;
//     }
//   }, [value.text]);

//   // Resize textarea height function
//   const resizeTextarea = useCallback(() => {
//     const el = textareaRef.current;
//     if (el) {
//       el.style.height = "auto";
//       el.style.height = `${el.scrollHeight}px`;
//     }
//   }, []);

//   // Debounce function helper (returns a stable debounced function)
//   function useDebouncedCallback<T extends (...args: any[]) => void>(
//     callback: T,
//     delay: number
//   ) {
//     const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//     const debouncedFn = useCallback(
//       (...args: Parameters<T>) => {
//         if (timeoutRef.current) clearTimeout(timeoutRef.current);
//         timeoutRef.current = setTimeout(() => {
//           callback(...args);
//         }, delay);
//       },
//       [callback, delay]
//     );

//     // Cleanup on unmount
//     useEffect(() => {
//       return () => {
//         if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       };
//     }, []);

//     return debouncedFn;
//   }

//   // Debounced resize function (called during typing)
//   const debouncedResize = useDebouncedCallback(resizeTextarea, DEBOUNCE_RESIZE_DELAY);

//   // Resize immediately when `type` changes (rare)
//   useEffect(() => {
//     resizeTextarea();
//   }, [value.type, resizeTextarea]);

//   // On input event (user typing), trigger debounced resize
//   const handleInput = useCallback(() => {
//     debouncedResize();
//   }, [debouncedResize]);

//   // OnChange handler: update local input and notify parent
//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       const newText = e.target.value;
//       cursorPosRef.current = e.target.selectionStart;

//       syncingFromPropRef.current = true;
//       setInputValue(newText);
//       onChange({ ...value, text: newText });
//       syncingFromPropRef.current = false;
//     },
//     [onChange, value]
//   );

//   // useLayoutEffect to restore cursor position & resize after every inputValue render
//   useLayoutEffect(() => {
//     resizeTextarea();

//     const el = textareaRef.current;
//     if (el && cursorPosRef.current !== null) {
//       try {
//         el.selectionStart = cursorPosRef.current;
//         el.selectionEnd = cursorPosRef.current;
//       } catch {
//         // In some edge cases, selection can throw, ignore it
//       }
//     }
//     cursorPosRef.current = null;
//   }, [inputValue, resizeTextarea]);

//   return (
//     <textarea
//       ref={textareaRef}
//       value={inputValue}
//       spellCheck={isEditMode}
//       onChange={handleChange}
//       onInput={handleInput}
//       className={clsx(
//         styles["text-cell-input"],
//         { [styles.preview]: !isEditMode },
//         styles[value.type] // styling by type
//       )}
//       rows={1}
//       style={{ height: "auto", overflow: "hidden" }}
//       disabled={isLockedMode}
//     />
//   );
// };

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
