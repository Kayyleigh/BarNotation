// components/layout/MainHeaderBar.tsx
import React from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";
import { useToast } from "../../hooks/toast/useToast";
import { useI18n } from "../../i18n/useI18n";

interface HeaderBarProps {
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenSettings,
  onOpenHotkeys,
}) => {
  const { showToast } = useToast();
  const { t } = useI18n(); // use language hook

  return (
    <header className="app-header sticky-header">
      <div className="header-left">
        <img className="app-logo" src="src/assets/logo.svg" alt="Logo" />
      </div>
      <div className="header-right">
        <Tooltip text={t("layout.header.hotkeys.tooltip")}>
          <button onClick={onOpenHotkeys} className={clsx("button")}>
            ⌨️ {t("layout.header.hotkeys.label")}
          </button>
        </Tooltip>

        <Tooltip text={t("layout.header.userGuide.tooltip")}>
          <button
            onClick={() => {
              showToast({
                message: t("layout.header.userGuide.toast"),
                type: "warning",
              });
            }}
            className={clsx("button")}
          >
            📚 {t("layout.header.userGuide.label")}
          </button>
        </Tooltip>

        <Tooltip text={t("layout.header.settings.tooltip")}>
          <button onClick={onOpenSettings} className={clsx("button")}>
            ⚙️ {t("layout.header.settings.label")}
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default React.memo(HeaderBar);
