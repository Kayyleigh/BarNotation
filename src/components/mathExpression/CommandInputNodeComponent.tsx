import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo
} from "react";
import clsx from "clsx";
import ReactDOM from "react-dom";
import styles from "./CommandInputNodeComponent.module.css";
import { specialSequences } from "../../models/specialSequences";
import { type TextNode, type CommandInputNode, type MathNode } from "../../models/types";
import MathView from "./MathView";
import { renderContainerChildren } from "./MathRenderers";
import type { BaseRenderProps, MathRendererProps } from "./MathRenderer";

interface Props {
  node: CommandInputNode;
  isSelected: boolean;
  onSelectSuggestion: (sequence: string) => void;
  baseProps: BaseRenderProps & MathRendererProps;
}

export function CommandInputNodeComponent({
  node,
  isSelected,
  onSelectSuggestion,
  baseProps
}: Props) {
  const inputString = node.children.map((n: TextNode) => n.content).join("");

  const [matching, setMatching] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0
  });

  const previews = useMemo(() => {
    const result: Record<string, MathNode> = {};
    for (const seq of matching) {
      const node = specialSequences.find(s => s.sequence === seq)?.createNode();
      if (node) result[seq] = node;
    }
    return result;
  }, [matching]);

  useEffect(() => {
    if (!isSelected || !inputString.startsWith("\\")) {
      setMatching([]);
      setShowDropdown(false);
      return;
    }

    const lowerInput = inputString.toLowerCase();
    const matches = specialSequences
      .map(seq => seq.sequence)
      .filter(seq => seq.toLowerCase().startsWith(lowerInput));

    setMatching(matches);
    setHighlight(0);
    setShowDropdown(matches.length > 0);
  }, [inputString, isSelected]);

  useLayoutEffect(() => {
    if (matching.length === 0 || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX
    });
  }, [matching.length, inputString]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSelected && anchorRef.current) {
      anchorRef.current.focus();
    }
  }, [isSelected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (matching.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(i => (i + 1) % matching.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(i => (i - 1 + matching.length) % matching.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      onSelectSuggestion(matching[highlight]);
      setShowDropdown(false);
    }
  };

  return (
    <>
      <span
        ref={anchorRef}
        className={clsx("math-node", "type-command-input")}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {renderContainerChildren(node.children, {
          ...baseProps,
          containerId: node.id,
          inheritedStyle: {
            fontStyling: {
              fontStyle: "command",
              fontStyleAlias: "",
            },
          },
        })}
      </span>

      {showDropdown &&
        ReactDOM.createPortal(
          <ul
            ref={dropdownRef}
            className={styles.autocompleteBox}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 1000,
            }}
          >
            {matching.map((seq, i) => (
              <li
                key={seq}
                ref={el => {
                  if (i === highlight && el) {
                    el.scrollIntoView({ block: "nearest" });
                  }
                }}
                className={clsx(styles.autocompleteItem, {
                  [styles.highlighted]: i === highlight,
                })}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents blur before click fires
                  onSelectSuggestion(seq);
                }}
              >
                <div className={styles.autocompleteRow}>
                  <span className={styles.commandLabel}>{seq}</span>
                  <div className={styles.mathPreview}>
                    {previews[seq] && (
                      <MathView node={previews[seq]} showPlaceHolder={true} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
