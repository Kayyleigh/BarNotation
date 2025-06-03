import { useEffect, useState, type RefObject } from "react";

export function useZoom(
  ref: RefObject<HTMLElement | null>,
  resetSignal: number,
  defaultZoom: number
) {
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const BASE_SIZE = 1.6; // rem

  // Apply zoom to local editor scope
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
        setZoomLevel((z) => Math.max(0.5, Math.min(2, z - e.deltaY * 0.01)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes("Mac");
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoomLevel((z) => Math.min(2, z + 0.1));
      } else if (ctrlKey && e.key === "-") {
        e.preventDefault();
        setZoomLevel((z) => Math.max(0.5, z - 0.1));
      } else if (ctrlKey && e.key === "0") {
        e.preventDefault();
        setZoomLevel(defaultZoom); // <- Fix here
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      node.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, defaultZoom]); // <- Track defaultZoom

  // Reset zoom externally (global reset button)
  useEffect(() => {
    setZoomLevel(defaultZoom); // <- Fix here
  }, [resetSignal, defaultZoom]);

  return zoomLevel;
}
