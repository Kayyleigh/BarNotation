// components/modals/HotkeyOverlay.tsx
import React from "react";
import styles from "./HotkeyOverlay.module.css";
import Modal from "../modals/Modal";

interface HotkeyOverlayProps {
  onClose: () => void;
}

const groupedHotkeys = [
  {
    title: "Input Shortcuts",
    keys: [
      [["Shift", "-"], "Make subscript"],
      [["Shift", "6"], "Make superscript (exponent)"],
      [["Ctrl", "Shift", "-"], "Make actuarial (bottom-left focus)"],
      [["Ctrl", "Shift", "6"], "Make actuarial (top-left focus)"],
      [["Alt", "-"], "Make actuarial (bottom-right focus)"],
      [["Alt", "6"], "Make actuarial (top-right focus)"],
      [["Shift", "↓"], "Make underset"],
      [["Shift", "↑"], "Make overset"],
      [["/"], "Turn node into numerator of new fraction"],
    ],
  },
  {
    title: "Structural Shortcuts",
    keys: [[["Drag & Drop"], "Rearrange nodes"]],
  },
  {
    title: "Editing & Navigation",
    keys: [
      [["Arrow Keys"], "Navigate between nodes"],
      [["Backspace"], "Delete node"],
      [["Ctrl", "C"], "Copy as LaTeX"],
      [["Ctrl", "X"], "Cut as LaTeX"],
      [["Ctrl", "V"], "Paste LaTeX"],
      [["Ctrl", "Z"], "Undo"],
      [["Ctrl", "Y"], "Redo"],
    ],
  },
  {
    title: "View Controls",
    keys: [
      [["Ctrl", "+"], "Zoom in"],
      [["Ctrl", "-"], "Zoom out"],
      [["Ctrl", "0"], "Reset zoom"],
    ],
  },
];

const HotkeyOverlay: React.FC<HotkeyOverlayProps> = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <h2>Keyboard Shortcuts</h2>
      {groupedHotkeys.map((group, idx) => (
        <div key={idx} className={styles.group}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <ul className={styles.list}>
            {group.keys.map(([combo, desc], i) => (
              <li key={i} className={styles.row}>
                <div className={styles.keys}>
                  {(combo as string[]).map((key, j, arr) => (
                    <React.Fragment key={j}>
                      <span className={styles.key}>{key}</span>
                      {j < arr.length - 1 && (
                        <span className={styles.separator}>+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className={styles.desc}>{desc}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Modal>
  );
};

export default HotkeyOverlay;