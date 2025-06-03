import React, { useEffect, useRef } from "react";
import "../styles/hotkeyOverlay.css";

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
    keys: [
      [["Drag & Drop"], "Rearrange nodes"],
    ],
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="hotkey-overlay">
      <div className="hotkey-overlay-content" ref={contentRef}>
        <button className="hotkey-close-button" onClick={onClose}>
          ✕
        </button>
        <h2>Keyboard Shortcuts</h2>

        {groupedHotkeys.map((group, idx) => (
          <div key={idx} className="hotkey-group">
            <h3>{group.title}</h3>
            <ul className="hotkey-list">
              {group.keys.map(([combo, desc], i) => (
                <li key={i} className="hotkey-row">
                  <div className="hotkey-keys">
                    {(combo as string[]).map((key, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="key">{key}</span>
                        {i < arr.length - 1 && (
                          <span className="key-separator">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="hotkey-desc">{desc}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotkeyOverlay;
