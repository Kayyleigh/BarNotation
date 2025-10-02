// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useLayoutEffect,
//   useMemo,
//   type JSX
// } from "react";
// import clsx from "clsx";
// import ReactDOM from "react-dom";
// import styles from "./CommandInputNodeComponent.module.css";
// import { specialSequences } from "../../models/specialSequences";
// import { type TextNode, type CommandInputNode, type MathNode } from "../../models/mathNodeTypes";
// import MathView from "./MathView";
// import type { CoreRenderProps } from "./MathRenderer";
// import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
// import { renderContainerChildren } from "./shared/renderContainerChildren";

// function getHighlightedSequence(seq: string, input: string): JSX.Element {
//   const seqBody = seq.startsWith("\\") ? seq.slice(1) : seq;
//   const inputBody = input.startsWith("\\") ? input.slice(1) : input;

//   const lowerSeq = seqBody.toLowerCase();
//   const lowerInput = inputBody.toLowerCase();

//   const matchIndex = lowerSeq.indexOf(lowerInput);

//   if (matchIndex === -1 || inputBody === "") {
//     return <>{seq}</>; // No match, return as-is
//   }

//   return (
//     <>
//       {"\\"}
//       {seqBody.slice(0, matchIndex)}
//       <span className={styles.highlightedText}>
//         {seqBody.slice(matchIndex, matchIndex + inputBody.length)}
//       </span>
//       {seqBody.slice(matchIndex + inputBody.length)}
//     </>
//   );
// }

// interface Props {
//   node: CommandInputNode;
//   isSelected: boolean;
//   onSelectSuggestion: (sequence: string) => void;
//   baseProps: CoreRenderProps;
//   Renderer: React.NamedExoticComponent<CoreRenderProps>;
// }

// export function CommandInputNodeComponent({
//   node,
//   isSelected,
//   onSelectSuggestion,
//   baseProps,
//   Renderer
// }: Props) {
//   const inputString = node.children.map((n: TextNode) => n.content).join("");

//   const { commandMap } = useCustomCommands();

//   const [matching, setMatching] = useState<string[]>([]);
//   const [highlight, setHighlight] = useState(0);
//   const [showDropdown, setShowDropdown] = useState(false);

//   const anchorRef = useRef<HTMLSpanElement>(null);
//   const dropdownRef = useRef<HTMLUListElement>(null);

//   const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
//     top: 0,
//     left: 0
//   });

//   const [dropdownMaxHeight, setDropdownMaxHeight] = useState(300);

//   // All sequences: special + custom
//   const allSequences = useMemo(() => {
//     const customSeqs = Object.keys(commandMap);
//     const specialSeqs = specialSequences.map(s => s.sequence);
//     return [...specialSeqs, ...customSeqs];
//   }, [commandMap]);

//   const { cursor, containerId, index } = baseProps;

//   // Check if cursor is directly after this node
//   const isCursorJustAfter =
//     cursor?.containerId === containerId &&
//     cursor?.index === index + 1;

//   // Should we show the dropdown?
//   const shouldTriggerDropdown =
//     (isSelected && inputString.startsWith("\\")) || isCursorJustAfter;

//   const previews = useMemo(() => {
//     const result: Record<string, MathNode> = {};
//     for (const seq of matching) {
//       const nodeFromSpecial = specialSequences.find(s => s.sequence === seq)?.createNode();
//       const nodeFromCustom = commandMap[seq]?.node;
//       if (nodeFromSpecial) result[seq] = nodeFromSpecial;
//       else if (nodeFromCustom) result[seq] = nodeFromCustom;
//     }
//     return result;
//   }, [matching, commandMap]);

//   //inputString is user's string
//   // possible prioritizations:
//   // St - if start is same as inputstring, then priority (because likely that user meant that one)
//   // Ap - if alphabetically earlier, then priority
//   // Mt - if higher number of characters match with inputstring, then priority
//   // My intuition: Mt -> St -> Ap ?
//   // Could also go further later, by doing lievenshchthdtein disctance

//   const byLocale = (a: string, b: string) =>
//     a.localeCompare(b);
//   const byStartMatch = (a: string, b: string, match: string) =>
//     (a.startsWith(match) ? 1 : 0) - (b.startsWith(match) ? 1 : 0); // ignore first "\"
//   const byMatchPercent = (a: string, b: string, input: string) =>
//     (a.toLowerCase().replace(input, "").length - b.toLowerCase().replace(input, "").length);
//   //TODO if length of replaced part is 0 (or 1 if the \) then don't? Cuz the sort by use case (i.e. order in code) is more useful in cases where user is "browsing" the options (e.g. to find \geq) 

//   useEffect(() => {
//     if (!shouldTriggerDropdown) {
//       setMatching([]);
//       setShowDropdown(false);
//       return;
//     }
//     const cleanInput = inputString.replace("\\", "");
//     const inputCommand = cleanInput.toLowerCase();

//     const sortMatches = (matches: string[], input: string): string[] => {
//       return matches.sort((a, b) => byStartMatch(a, b, input) || byMatchPercent(a, b, input) || byLocale(a, b));
//     };

//     const matches = sortMatches(allSequences.filter(seq =>
//       seq.replace("\\", "").toLowerCase().includes(inputCommand)
//     ), cleanInput);

//     setMatching(matches);
//     setHighlight(0);
//     setShowDropdown(matches.length > 0);
//   }, [inputString, shouldTriggerDropdown, allSequences]);

//   useLayoutEffect(() => {
//     if (!matching.length || !anchorRef.current) return;

//     const rect = anchorRef.current.getBoundingClientRect();
//     const viewportHeight = window.innerHeight;

//     const spaceBelow = viewportHeight - rect.bottom;
//     const spaceAbove = rect.top;

//     let top = rect.bottom + window.scrollY + 4;
//     let availableSpace = spaceBelow;

//     // If not enough space below but more space above, place it above
//     if (spaceBelow < 150 && spaceAbove > spaceBelow) {
//       top = rect.top + window.scrollY - 4; // we'll subtract height later
//       availableSpace = spaceAbove;
//     }

//     const dropdownHeight = Math.min(400, Math.max(availableSpace - 8, 100));

//     // If placed above, shift up by its height
//     if (availableSpace === spaceAbove) {
//       top -= dropdownHeight;
//     }

//     setDropdownPos({
//       top,
//       left: rect.left + window.scrollX
//     });
//     setDropdownMaxHeight(dropdownHeight);

//   }, [matching.length, inputString]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         anchorRef.current &&
//         !anchorRef.current.contains(event.target as Node) &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if ((isSelected || isCursorJustAfter) && anchorRef.current) {
//       anchorRef.current.focus();
//     }
//   }, [isSelected, isCursorJustAfter]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (matching.length === 0) return;

//     if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {

//       // Steal focus

//       e.preventDefault();  // prevent MathEditor from using it
//       // e.stopPropagation(); // stop bubbling
//     }

//     switch (e.key) {
//       case "ArrowDown":
//         setHighlight(i => (i + 1) % matching.length);
//         break;
//       case "ArrowUp":
//         setHighlight(i => (i - 1 + matching.length) % matching.length);
//         break;
//       case "Enter":
//       case "Tab":
//         onSelectSuggestion(matching[highlight]);
//         setShowDropdown(false);
//         break;
//     }
//   };

//   return (
//     <>
//       <span
//         ref={anchorRef}
//         className={clsx("math-node", "type-command-input")}
//         tabIndex={0}
//         onKeyDown={handleKeyDown}
//       >
//         {renderContainerChildren(node.children, {
//           ...baseProps,
//           containerId: node.id,
//           inheritedStyle: {
//             fontStyling: {
//               fontStyle: "command",
//               fontStyleAlias: "",
//             },
//           },
//         }, Renderer)}
//       </span>

//       {showDropdown &&
//         ReactDOM.createPortal(
//           <ul
//             ref={dropdownRef}
//             className={styles.autocompleteBox}
//             style={{
//               position: "absolute",
//               top: dropdownPos.top,
//               left: dropdownPos.left,
//               zIndex: 1000,
//               maxHeight: dropdownMaxHeight,
//             }}
//           >
//             {matching.map((seq, i) => {
//               const isCustom = !!commandMap[seq]; // true if custom command
//               return (
//                 <li
//                   key={seq}
//                   ref={el => {
//                     if (i === highlight && el) {
//                       el.scrollIntoView({ block: "nearest" });
//                     }
//                   }}
//                   className={clsx(
//                     styles.autocompleteItem,
//                     { [styles.customCommand]: isCustom },
//                     { [styles.highlighted]: i === highlight },
//                   )}
//                   onMouseDown={(e) => {
//                     e.preventDefault(); // prevents blur before click fires
//                     onSelectSuggestion(seq);
//                   }}
//                 >
//                   <div className={styles.autocompleteRow}>
//                     <span className={styles.commandLabel}>
//                       {isCustom && "👤 "}
//                       {getHighlightedSequence(seq, inputString)}
//                     </span>
//                     <div className={styles.mathPreview}>
//                       {previews[seq] && <MathView node={previews[seq]} showPlaceHolder={true} />}
//                     </div>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>,
//           document.body
//         )}
//     </>
//   );
// }
import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
  type JSX
} from "react";
import clsx from "clsx";
import ReactDOM from "react-dom";
import styles from "./CommandInputNodeComponent.module.css";
import { specialSequences } from "../../models/specialSequences";
import { type TextNode, type CommandInputNode, type MathNode } from "../../models/mathNodeTypes";
import MathView from "./MathView";
import type { CoreRenderProps } from "./MathRenderer";
import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
import { renderContainerChildren } from "./shared/renderContainerChildren";

/** Utility helpers **/
const stripBackslash = (seq: string) => seq.startsWith("\\") ? seq.slice(1) : seq;
const normalize = (seq: string) => stripBackslash(seq).toLowerCase();

function scoreMatch(candidate: string, input: string): number {
  const idx = normalize(candidate).indexOf(input);
  if (idx === -1) return Infinity; // no match, push to bottom
  // Lower score is better
  return idx * 10 + (normalize(candidate).length - input.length);
}

function getHighlightedSequence(seq: string, input: string): JSX.Element {
  const seqBody = stripBackslash(seq);
  const inputBody = stripBackslash(input);

  const lowerSeq = seqBody.toLowerCase();
  const lowerInput = inputBody.toLowerCase();

  const matchIndex = lowerSeq.indexOf(lowerInput);

  if (matchIndex === -1 || inputBody === "") {
    return <>{seq}</>; // No match, return as-is
  }

  return (
    <>
      {"\\"}
      {seqBody.slice(0, matchIndex)}
      <span className={styles.highlightedText}>
        {seqBody.slice(matchIndex, matchIndex + inputBody.length)}
      </span>
      {seqBody.slice(matchIndex + inputBody.length)}
    </>
  );
}

interface Props {
  node: CommandInputNode;
  isSelected: boolean;
  onSelectSuggestion: (sequence: string) => void;
  baseProps: CoreRenderProps;
  Renderer: React.NamedExoticComponent<CoreRenderProps>;
}

export function CommandInputNodeComponent({
  node,
  isSelected,
  onSelectSuggestion,
  baseProps,
  Renderer
}: Props) {
  const inputString = node.children.map((n: TextNode) => n.content).join("");

  const { commandMap } = useCustomCommands();

  const [matching, setMatching] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0
  });

  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(300);

  // All sequences: special + custom
  const allSequences = useMemo(() => {
    const customSeqs = Object.keys(commandMap);
    const specialSeqs = specialSequences.map(s => s.sequence);
    return [...specialSeqs, ...customSeqs];
  }, [commandMap]);

  const { cursor, containerId, index } = baseProps;

  // Check if cursor is directly after this node
  const isCursorJustAfter =
    cursor?.containerId === containerId &&
    cursor?.index === index + 1;

  // Should we show the dropdown?
  const shouldTriggerDropdown =
    (isSelected && inputString.startsWith("\\")) || isCursorJustAfter;

  const previews = useMemo(() => {
    const result: Record<string, MathNode> = {};
    for (const seq of matching) {
      const nodeFromSpecial = specialSequences.find(s => s.sequence === seq)?.createNode();
      const nodeFromCustom = commandMap[seq]?.node;
      if (nodeFromSpecial) result[seq] = nodeFromSpecial;
      else if (nodeFromCustom) result[seq] = nodeFromCustom;
    }
    return result;
  }, [matching, commandMap]);

  /** Sorting priorities **/
  const byLocale = (a: string, b: string) => a.localeCompare(b);

  useEffect(() => {
    if (!shouldTriggerDropdown) {
      setMatching([]);
      setShowDropdown(false);
      return;
    }

    const inputCommand = stripBackslash(inputString);
    const normalizedInput = normalize(inputString);

    // const sortMatches = (matches: string[], input: string): string[] => {
    //   return matches.sort((a, b) =>
    //     byStartMatch(a, b, input) ||
    //     byMatchPercent(a, b, input) ||
    //     byLocale(a, b)
    //   );
    // };

    const sortMatches = (matches: string[], input: string): string[] => {
      return matches.sort((a, b) => scoreMatch(a, input) - scoreMatch(b, input) || byLocale(a, b));
    };

    const matches = sortMatches(
      allSequences.filter(seq => normalize(seq).includes(normalizedInput)),
      inputCommand
    );

    setMatching(matches);
    setHighlight(0);
    setShowDropdown(matches.length > 0);
  }, [inputString, shouldTriggerDropdown, allSequences]);

  useLayoutEffect(() => {
    if (!matching.length || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom + window.scrollY + 4;
    let availableSpace = spaceBelow;

    if (spaceBelow < 150 && spaceAbove > spaceBelow) {
      top = rect.top + window.scrollY - 4;
      availableSpace = spaceAbove;
    }

    const dropdownHeight = Math.min(400, Math.max(availableSpace - 8, 100));

    if (availableSpace === spaceAbove) {
      top -= dropdownHeight;
    }

    setDropdownPos({
      top,
      left: rect.left + window.scrollX
    });
    setDropdownMaxHeight(dropdownHeight);
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
    if ((isSelected || isCursorJustAfter) && anchorRef.current) {
      anchorRef.current.focus();
    }
  }, [isSelected, isCursorJustAfter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (matching.length === 0) return;

    if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlight(i => (i + 1) % matching.length);
        break;
      case "ArrowUp":
        setHighlight(i => (i - 1 + matching.length) % matching.length);
        break;
      case "Enter":
      case "Tab":
        onSelectSuggestion(matching[highlight]);
        setShowDropdown(false);
        break;
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
        }, Renderer)}
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
              maxHeight: dropdownMaxHeight,
            }}
          >
            {matching.map((seq, i) => {
              const isCustom = !!commandMap[seq];
              return (
                <li
                  key={seq}
                  ref={el => {
                    if (i === highlight && el) {
                      el.scrollIntoView({ block: "nearest" });
                    }
                  }}
                  className={clsx(
                    styles.autocompleteItem,
                    { [styles.customCommand]: isCustom },
                    { [styles.highlighted]: i === highlight },
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectSuggestion(seq);
                  }}
                >
                  <div className={styles.autocompleteRow}>
                    <span className={styles.commandLabel}>
                      {isCustom && "👤 "}
                      {getHighlightedSequence(seq, inputString)}
                    </span>
                    <div className={styles.mathPreview}>
                      {previews[seq] && <MathView node={previews[seq]} showPlaceHolder={true} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
