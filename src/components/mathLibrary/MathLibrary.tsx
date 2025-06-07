import React from "react";
import ResizableSidebar from "../layout/ResizableSidebar";

interface MathLibraryProps {
  width: number;
  onWidthChange: (width: number) => void;
}

const MathLibrary: React.FC<MathLibraryProps> = ({ width, onWidthChange }) => {
  return (
    <ResizableSidebar
      side="right"
      title="math library"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="mathLibraryWidth"
    >
      <h3>Math Library (WIP)</h3>
      <p>
        Later, you will be able to drag math back and forth between the math cells and the library.
        You will be able to make collections of math snippets, so you can re-use common expressions
        very quickly.
      </p>
      <div style={{ height: "1500px" }}>Scroll me to test that scrolling works</div>
    </ResizableSidebar>
  );
};

export default MathLibrary;
