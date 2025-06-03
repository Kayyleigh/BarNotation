// import { useEffect, useState, type RefObject } from "react";

// export function useZoom(ref: RefObject<HTMLElement | null>) {
//   const [zoomLevel, setZoomLevel] = useState(1);

//   const BASE_SIZE = 1.6; // rem

//   useEffect(() => {
//     const root = document.documentElement;
//     root.style.setProperty("--local-math-font-size-base", `${zoomLevel * BASE_SIZE}rem`);
//   }, [zoomLevel]);

//   useEffect(() => {
//     const node = ref.current;
//     if (!node) return;

//     const handleWheel = (e: WheelEvent) => {
//       if (e.ctrlKey) {
//         e.preventDefault();
//         setZoomLevel((z) => Math.max(0.5, Math.min(2, z - e.deltaY * 0.01)));
//       }
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       const isMac = navigator.platform.includes("Mac");
//       const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

//       if (ctrlKey && (e.key === "+" || e.key === "=")) {
//         e.preventDefault();
//         setZoomLevel((z) => Math.min(2, z + 0.1));
//       } else if (ctrlKey && e.key === "-") {
//         e.preventDefault();
//         setZoomLevel((z) => Math.max(0.5, z - 0.1));
//       } else if (ctrlKey && e.key === "0") {
//         e.preventDefault();
//         setZoomLevel(1);
//       }
//     };

//     node.addEventListener("wheel", handleWheel, { passive: false });
//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       node.removeEventListener("wheel", handleWheel);
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [ref]);

//     // Reset zoom if resetSignal changes (external trigger)
//     useEffect(() => {
//         setZoomLevel(1);
//       }, [resetSignal]);

//   return zoomLevel;
// }

import { useEffect, useState, type RefObject } from "react";

export function useZoom(ref: RefObject<HTMLElement | null>, resetSignal: number) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const BASE_SIZE = 1.6; // rem

  // Apply zoom on the editor container element only
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Set a CSS variable scoped to this editor container,
    // so styles inside can reference var(--local-math-font-size-base)
    node.style.setProperty("--local-math-font-size-base", `${zoomLevel * BASE_SIZE}rem`);
  }, [zoomLevel, ref]);

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
        setZoomLevel(1);
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      node.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref]);

  // Reset zoom if resetSignal changes (external trigger)
  useEffect(() => {
    setZoomLevel(1);
  }, [resetSignal]);

  return zoomLevel;
}
