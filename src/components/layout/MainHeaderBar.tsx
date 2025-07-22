// components/layout/MainHeaderBar.tsx
import React from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";
import { useToast } from "../../hooks/useToast";

interface HeaderBarProps {
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenSettings,
  onOpenHotkeys,
}) => {
  const { showToast } = useToast();
  
  return (
    <header className="app-header sticky-header">
      <div className="header-left">
        <img className="app-logo" src="src/assets/logo.svg" alt="Logo" />
      </div>
      <div className="header-right">
        <Tooltip text="Show hotkey overview">
            <button onClick={onOpenHotkeys} className={clsx("button")}>⌨️ Hotkeys</button>
        </Tooltip>
        <Tooltip text="Open user guide">
            <button 
            onClick={() => {
              showToast({ message: `User guide is not yet written`, type: "warning" });
            }} 
            className={clsx("button")}>
              📚 User Guide
            </button>
        </Tooltip>
        <Tooltip text="Change your settings">
            <button onClick={onOpenSettings} className={clsx("button")}>⚙️ Settings</button>
        </Tooltip>
      </div>
    </header>
  );
};

export default React.memo(HeaderBar);
