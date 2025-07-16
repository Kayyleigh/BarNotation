// hooks/useResizablePanels.ts
import { useCallback, useMemo, useState } from "react";

const MIN_CONTENT = 0;
const COLLAPSED = 8;
const DEFAULT_L = 220;
const DEFAULT_R = 320;

export type PanelSide = "left" | "right";

export type PanelState = {
  width: number;
  collapsed: boolean;
};

export type LayoutState = {
  left: PanelState;
  right: PanelState;
};

export type ResizableCtx = {
  state: LayoutState;
  setWidth: (side: PanelSide, w: number) => void;
  toggle: (side: PanelSide) => void;
};

export const useResizablePanelsHook = (): { value: ResizableCtx } => {
  const safeWindowWidth = () =>
    typeof window !== "undefined" ? window.innerWidth : 1920;

  const getWidth = (key: string, fallback: number): number => {
    const parsed = parseInt(localStorage.getItem(key) ?? "");
    return isNaN(parsed) ? fallback : parsed;
  };

  const [state, setState] = useState<LayoutState>(() => ({
    left: {
      width: getWidth("left-width", DEFAULT_L),
      collapsed: localStorage.getItem("left-collapsed") === "true",
    },
    right: {
      width: getWidth("right-width", DEFAULT_R),
      collapsed: localStorage.getItem("right-collapsed") === "true",
    },
  }));

  const setWidth = useCallback((side: PanelSide, desiredWidth: number) => {
    setState(prev => {
      if (prev[side].collapsed) return prev;
  
      const totalWidth = safeWindowWidth();
      const newWidth = Math.max(COLLAPSED, desiredWidth);
      const isShrink = newWidth < prev[side].width;
  
      const leftWidth = side === "left" ? newWidth : (prev.left.collapsed ? COLLAPSED : prev.left.width);
      const rightWidth = side === "right" ? newWidth : (prev.right.collapsed ? COLLAPSED : prev.right.width);
  
      const editorWidth = totalWidth - leftWidth - rightWidth;
  
      const finalWidth = (editorWidth < MIN_CONTENT && !isShrink)
        ? totalWidth - (side === "left" ? rightWidth : leftWidth)
        : newWidth;
  
      localStorage.setItem(`${side}-width`, String(finalWidth));
    
      return {
        ...prev,
        [side]: { ...prev[side], width: finalWidth }
      };
    });
  }, []);  

  const toggle = useCallback((side: PanelSide) => {
    setState(prev => {
      const panel = prev[side];
      const other = side === "left" ? prev.right : prev.left;
      const total = safeWindowWidth();

      const editor =
        total -
        (panel.collapsed ? COLLAPSED : panel.width) -
        (other.collapsed ? COLLAPSED : other.width);


      if (!panel.collapsed && editor < MIN_CONTENT) return prev;

      const next = {
        ...prev,
        [side]: { ...panel, collapsed: !panel.collapsed },
      };
      localStorage.setItem(`${side}-collapsed`, String(!panel.collapsed));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ state, setWidth, toggle }), [state, setWidth, toggle]);

  return { value };
};
