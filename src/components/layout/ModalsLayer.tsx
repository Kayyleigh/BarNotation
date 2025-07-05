import React from "react";
import ReactDOM from "react-dom";
import HotkeyOverlay from "../modals/HotkeyOverlay";
import SettingsModal from "../modals/SettingsModal";

export type ModalsLayerProps = {
  showHotkeys: boolean;
  onCloseHotkeys: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
  settingsProps: {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    showColorInPreview: boolean;
    toggleShowColorInPreview: () => void;
    authorName: string;
    setAuthorName: (name: string) => void;
    nerdMode: boolean;
    toggleNerdMode: () => void;
  };
};

const ModalsLayer: React.FC<ModalsLayerProps> = ({
  showHotkeys,
  onCloseHotkeys,
  showSettings,
  onCloseSettings,
  settingsProps,
}) => {
  return ReactDOM.createPortal(
    <>
      {showHotkeys && <HotkeyOverlay onClose={onCloseHotkeys} />}
      {showSettings && <SettingsModal onClose={onCloseSettings} {...settingsProps} />}
    </>,
    document.getElementById("modal-root")!
  );
};

export default React.memo(ModalsLayer);
