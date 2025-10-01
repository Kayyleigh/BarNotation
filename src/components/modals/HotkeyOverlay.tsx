// components/modals/HotkeyOverlay.tsx
import React from "react";
import styles from "./HotkeyOverlay.module.css";
import Modal from "../modals/Modal";
import { useI18n } from "../../i18n/useI18n";

interface HotkeyOverlayProps {
  onClose: () => void;
}

const HotkeyOverlay: React.FC<HotkeyOverlayProps> = ({ onClose }) => {
  const { t } = useI18n();

  const groupedHotkeys = [
    {
      title: t("modals.hotkeysModal.mathInputShortcuts"),
      keys: [
        [["Shift", "-"], t("modals.hotkeysModal.subscript")],
        [["Shift", "6"], t("modals.hotkeysModal.superscript")],
        [["Shift", "Alt", "-"], t("modals.hotkeysModal.actuarialBL")],
        [["Shift", "Alt", "6"], t("modals.hotkeysModal.actuarialTL")],
        [["Alt", "-"], t("modals.hotkeysModal.actuarialBR")],
        [["Alt", "6"], t("modals.hotkeysModal.actuarialTR")],
        [["Shift", "↑"], t("modals.hotkeysModal.overset")],
        [["Shift", "↓"], t("modals.hotkeysModal.underset")],
        [["Shift", "Alt", "↑"], t("modals.hotkeysModal.nthtop")],
        [["Shift", "Alt", "↓"], t("modals.hotkeysModal.nthbottom")],

        [["Ctrl", "↑"], t("modals.hotkeysModal.insertMatrixRowAbove")],
        [["Ctrl", "↓"], t("modals.hotkeysModal.insertMatrixRowBelow")],
        [["Ctrl", "←"], t("modals.hotkeysModal.insertMatrixColumnLeft")],
        [["Ctrl", "→"], t("modals.hotkeysModal.insertMatrixColumnRight")],

        [["/"], t("modals.hotkeysModal.fraction")],
        [["\\"], t("modals.hotkeysModal.command")],
      ],
    },
    {
      title: t("modals.hotkeysModal.cellContentEditingAndNavigation"),
      keys: [
        [["Arrow Keys"], t("modals.hotkeysModal.navigate")],
        [["Shift", "←/→"], t("modals.hotkeysModal.fastNavigate")],
        [["Home"], t("modals.hotkeysModal.jumpToCellStart")],
        [["End"], t("modals.hotkeysModal.jumpToCellEnd")],
        [["Backspace"], t("modals.hotkeysModal.backspace")],
        [["Delete"], t("modals.hotkeysModal.delete")],
        [["Ctrl", "C"], t("modals.hotkeysModal.copy")],
        [["Ctrl", "X"], t("modals.hotkeysModal.cut")],
        [["Ctrl", "V"], t("modals.hotkeysModal.paste")],
        [["Ctrl", "Z"], t("modals.hotkeysModal.undo")],
        [["Ctrl", "Y"], t("modals.hotkeysModal.redo")],
        [["Drag & Drop"], t("modals.hotkeysModal.rearrangeNodes")],
        [["Alt", ",/."], t("modals.hotkeysModal.cycleTextTypes")],
      ],
    },
    {
      title: t("modals.hotkeysModal.cellListEditingAndNavigation"),
      keys: [
        [["Alt", "↑"], t("modals.hotkeysModal.navigateCellUp")],
        [["Alt", "↓"], t("modals.hotkeysModal.navigateCellDown")],
        [["Alt", "Del"], t("modals.hotkeysModal.deleteCurrCell")],
        [["Alt", "="], t("modals.hotkeysModal.duplicateCurrCell")],
        [["Alt", "Digit", "↑"], t("modals.hotkeysModal.insertCellAbove")],
        [["Alt", "Digit", "↓"], t("modals.hotkeysModal.insertCellBelow")],
      ],
    },
    {
      title: t("modals.hotkeysModal.notebookShortcuts"),
      keys: [
        [["Alt", "P"], t("modals.hotkeysModal.togglePreview")],
        [["Alt", "L"], t("modals.hotkeysModal.toggleLocked")],
        [["Alt", "1"], t("modals.hotkeysModal.appendMath")],
        [["Alt", "2"], t("modals.hotkeysModal.appendText")],
      ],
    },
    {
      title: t("modals.hotkeysModal.generalShortcuts"),
      keys: [
        [["Ctrl", "/"], t("modals.hotkeysModal.openHotkeyModal")],
        [["Esc"], t("modals.hotkeysModal.closeOverlay")],
      ],
    },
    {
      title: t("modals.hotkeysModal.viewControls"),
      keys: [
        [["Ctrl", "+"], t("modals.hotkeysModal.zoomIn")],
        [["Ctrl", "-"], t("modals.hotkeysModal.zoomOut")],
        [["Ctrl", "0"], t("modals.hotkeysModal.zoomReset")],
      ],
    },
  ];

  return (
    <Modal onClose={onClose}>
      <h2>{t("modals.hotkeysModal.title")}</h2>
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
