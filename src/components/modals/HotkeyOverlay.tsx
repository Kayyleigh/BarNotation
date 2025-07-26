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
      title: t("modals.hotkeysModal.inputShortcuts"),
      keys: [
        [["Shift", "-"], t("modals.hotkeysModal.subscript")],
        [["Shift", "6"], t("modals.hotkeysModal.superscript")],
        [["Ctrl", "Shift", "-"], t("modals.hotkeysModal.actuarialBL")],
        [["Ctrl", "Shift", "6"], t("modals.hotkeysModal.actuarialTL")],
        [["Alt", "-"], t("modals.hotkeysModal.actuarialBR")],
        [["Alt", "6"], t("modals.hotkeysModal.actuarialTR")],
        [["Shift", "↓"], t("modals.hotkeysModal.underset")],
        [["Shift", "↑"], t("modals.hotkeysModal.overset")],
        [["/"], t("modals.hotkeysModal.fraction")],
      ],
    },
    {
      title: t("modals.hotkeysModal.structuralShortcuts"),
      keys: [[["Drag & Drop"], t("modals.hotkeysModal.rearrangeNodes")]],
    },
    {
      title: t("modals.hotkeysModal.editingAndNavigation"),
      keys: [
        [["Arrow Keys"], t("modals.hotkeysModal.navigate")],
        [["Backspace"], t("modals.hotkeysModal.delete")],
        [["Ctrl", "C"], t("modals.hotkeysModal.copy")],
        [["Ctrl", "X"], t("modals.hotkeysModal.cut")],
        [["Ctrl", "V"], t("modals.hotkeysModal.paste")],
        [["Ctrl", "Z"], t("modals.hotkeysModal.undo")],
        [["Ctrl", "Y"], t("modals.hotkeysModal.redo")],
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
