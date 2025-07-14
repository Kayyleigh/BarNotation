import { useEffect, useState, type RefObject } from "react";
import { MAX_ZOOM, MIN_ZOOM } from "../constants/editorConstants";

export function useZoom(
  ref: RefObject<HTMLElement | null>,
  resetSignal: number,
  defaultZoom: number
) {
  // Independent, absolute zoom level (e.g., 1.0 = 100%, 1.2 = 120%)
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);

  const BASE_SIZE = 1; // rem

  // Apply zoom to editor DOM
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.style.setProperty(
      "--local-math-font-size-base",
      `${zoomLevel * BASE_SIZE}rem`
    );
  }, [zoomLevel, ref]);

  // Wheel + key zoom handlers
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoomLevel((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z - e.deltaY * 0.01)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.includes("Mac");
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoomLevel((z) => Math.min(MAX_ZOOM, z + 0.1));
      } else if (ctrlKey && e.key === "-") {
        e.preventDefault();
        setZoomLevel((z) => Math.max(MIN_ZOOM, z - 0.1));
      } else if (ctrlKey && e.key === "0") {
        e.preventDefault();
        setZoomLevel(defaultZoom); // reset to latest provided default
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      node.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, defaultZoom]);

  // Reset on external signal or new defaultZoom
  useEffect(() => {
    setZoomLevel(defaultZoom);
  }, [resetSignal, defaultZoom]);

  return zoomLevel;
}
