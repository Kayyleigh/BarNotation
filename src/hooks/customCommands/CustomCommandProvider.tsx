import React, { useState, useEffect } from "react";
import type { MathNodeLibrary, LibraryEntry } from "../../models/libraryTypes";
import { CustomCommandContext, type CustomCommandContextType } from "./customCommandContext";

interface Props {
  library: MathNodeLibrary;
  children: React.ReactNode;
}

export const CustomCommandProvider: React.FC<Props> = ({ library, children }) => {
  const [commandMap, setCommandMap] = useState<Record<string, LibraryEntry>>({});

  const buildCommandMap = (lib: MathNodeLibrary) => {
    const map: Record<string, LibraryEntry> = {};
    Object.values(lib.entries).forEach((entry) => {
      if (entry.commandSequence) map["\\" + entry.commandSequence + " "] = entry; //TODO maybe just node?
    });
    return map;
  };

  useEffect(() => {
    setCommandMap(buildCommandMap(library));
  }, [library]);

  const refresh = (lib: MathNodeLibrary) => {
    setCommandMap(buildCommandMap(lib));
  };

  const value: CustomCommandContextType = { commandMap, refresh };

  return <CustomCommandContext.Provider value={value}>{children}</CustomCommandContext.Provider>;
};
