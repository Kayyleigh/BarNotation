// top-level component
import React, { useState } from "react";
import MainLayout from "./layout/MainLayout";
import SettingsModal from "./modals/SettingsModal";
import HotkeyOverlay from "./modals/HotkeyOverlay";

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  return (
    <>
      <MainLayout
        onOpenSettings={() => setShowSettings(true)}
        onOpenHotkeys={() => setShowHotkeys(true)}
      />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
    </>
  );
};

export default App;
