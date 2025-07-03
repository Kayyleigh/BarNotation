import { createContext } from "react";

export interface HoverContextType {
    hoverPath: string[];
    setHoverPath: (path: string[]) => void;
  }
  
  export const HoverContext = createContext<HoverContextType | null>(null);