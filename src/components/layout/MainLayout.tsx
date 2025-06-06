// MainLayout.tsx
import React, { useState } from "react";
import HeaderBar from "./HeaderBar";
import NotesMenu from "./NotesMenu";
import EditorPane from "./EditorPane";
import MathLibrary from "./MathLibrary";

const MainLayout: React.FC<{
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
}> = ({ onOpenSettings, onOpenHotkeys }) => {
  // Manage which note is selected here and pass down
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Manage width for resizable panes (could be useState or useRef + onDrag logic)
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(300);

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={onOpenSettings}
        onOpenHotkeys={onOpenHotkeys}
        // Pass other props or callbacks as needed
      />

      <div className="content" style={{ display: "flex", height: "calc(100vh - 50px)" }}>
        <NotesMenu
          width={leftWidth}
          onWidthChange={setLeftWidth}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />

        <EditorPane
          style={{ flexGrow: 1 }}
          noteId={selectedNoteId}
          // pass relevant props & callbacks
        />

        <MathLibrary
          width={rightWidth}
          onWidthChange={setRightWidth}
          // pass relevant props
        />
      </div>
    </div>
  );
};

export default MainLayout;
