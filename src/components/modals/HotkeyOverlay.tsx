// components/modals/HotkeyOverlay.tsx
import React from "react";
import styles from "./HotkeyOverlay.module.css";
import Modal from "../modals/Modal";
import { useI18n } from "../../i18n/useI18n";
import { hotkeyGroups } from "../../models/hotkeys";

interface HotkeyOverlayProps {
  onClose: () => void;
}

const HotkeyOverlay: React.FC<HotkeyOverlayProps> = ({ onClose }) => {
  const { t } = useI18n();

  return (
    <Modal onClose={onClose}>
      <h2>{t("modals.hotkeysModal.title")}</h2>

      {hotkeyGroups.map((group) => (
        <div key={group.id} className={styles.group}>
          <h3 className={styles.groupTitle}>{t(group.titleId)}</h3>

          {/* Render top-level keys */}
          <ul className={styles.list}>
            {/* Render subgroups if any */}
            {group.subGroups?.map((sub) => (
              <div key={sub.id} className={styles.subgroup}>
                <h4 className={styles.subgroupTitle}>{t(sub.titleId)}</h4>
                <ul className={styles.list}>
                  {sub.keys.map((hk, i) => (
                    <li key={i} className={styles.row}>
                      <div className={styles.keys}>
                        {hk.combo?.map((key, j, arr) => (
                          <React.Fragment key={j}>
                            <span className={styles.key}>{key}</span>
                            {j < arr.length - 1 && (
                              <span className={styles.separator}>+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className={styles.desc}>{t(hk.descriptionId!)}</div>
                      {hk.preview && <div className={styles.preview}>{hk.preview}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {group.keys.map((hk, i) => (
              <li key={i} className={styles.row}>
                <div className={styles.keys}>
                  {hk.combo?.map((key, j, arr) => (
                    <React.Fragment key={j}>
                      <span className={styles.key}>{key}</span>
                      {j < arr.length - 1 && (
                        <span className={styles.separator}>+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className={styles.desc}>{t(hk.descriptionId!)}</div>
                {hk.preview && <div className={styles.preview}>{hk.preview}</div>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Modal>
  );
}

export default HotkeyOverlay;
