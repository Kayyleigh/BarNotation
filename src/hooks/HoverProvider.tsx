import React, { useState, type ReactNode } from "react";
import { HoverContext, type HoverContextType } from "./HoverContext";

interface HoverProviderProps {
  children: ReactNode;
}

export const HoverProvider: React.FC<HoverProviderProps> = ({ children }) => {
  const [hoverPath, setHoverPath] = useState<string[]>([]);

  const contextValue: HoverContextType = {
    hoverPath,
    setHoverPath,
  };

  return (
    <HoverContext.Provider value={contextValue}>
      {children}
    </HoverContext.Provider>
  );
};
