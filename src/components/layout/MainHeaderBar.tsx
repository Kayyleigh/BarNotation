import React from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";

interface HeaderBarProps {
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenSettings,
  onOpenHotkeys,
}) => {
  return (
    <header className="app-header sticky-header">
      <div className="header-left">
        <img className="app-logo" src="src/assets/logo.svg" alt="Logo" />
      </div>
      <div className="header-right">
        <Tooltip text="Show hotkey overview">
            <button onClick={onOpenHotkeys} className={clsx("button")}>⌨️ Hotkeys</button>
        </Tooltip>
        <Tooltip text="Change your settings">
            <button onClick={onOpenSettings} className={clsx("button")}>⚙️ Settings</button>
        </Tooltip>
      </div>
    </header>
  );
};

export default HeaderBar;
