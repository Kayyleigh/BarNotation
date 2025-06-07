import React from "react";
import clsx from "clsx";

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
        <button onClick={onOpenHotkeys} className={clsx("button")}>⌨️ Hotkeys</button>
        <button onClick={onOpenSettings} className={clsx("button")}>⚙️ Settings</button>
      </div>
    </header>
  );
};

export default HeaderBar;
