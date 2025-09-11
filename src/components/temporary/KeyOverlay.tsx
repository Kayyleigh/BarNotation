import React, { useEffect, useState, useRef } from "react";
import styles from "./KeyOverlay.module.css";

type Entry = {
  id: number;
  label: string;
  timestamp: number;
};

const CLEANUP_TIMEOUT = 2000; // finalize stuck combos after 2s
const HISTORY_LIMIT = 4; // show last N finalized entries

const KeyOverlay: React.FC = () => {
  const [liveKeys, setLiveKeys] = useState<string[]>([]);
  const [history, setHistory] = useState<Entry[]>([]);
  const activeKeysRef = useRef<Set<string>>(new Set());
  const counterRef = useRef(0);
  const lastUpdateRef = useRef<number>(Date.now());

  const normalizeKey = (key: string): string => {
    if (key === " ") return "Space";
    if (key === "Meta") return "Cmd";
    if (key === "Control") return "Ctrl";
    if (key === "ArrowUp") return "↑";
    if (key === "ArrowDown") return "↓";
    if (key === "ArrowLeft") return "←";
    if (key === "ArrowRight") return "→";
    return key.length === 1 ? key.toUpperCase() : key;
  };

  const finalizeEntry = (keys: string[] | string) => {
    const label = Array.isArray(keys)
      ? keys.join(" + ")
      : keys; // label is either string or combination
    const id = counterRef.current++;
    setHistory((prev) => {
      const updated = [...prev, { id, label, timestamp: Date.now() }];
      return updated.slice(-HISTORY_LIMIT);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLabel = normalizeKey(e.key);
      const active = new Set(activeKeysRef.current);
      if (!active.has(keyLabel)) {
        active.add(keyLabel);
        activeKeysRef.current = active;
        setLiveKeys(Array.from(active));
        lastUpdateRef.current = Date.now();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyLabel = normalizeKey(e.key);
      const active = new Set(activeKeysRef.current);
      active.delete(keyLabel);
      activeKeysRef.current = active;

      // finalize entry with the keys *before removal*
      finalizeEntry([...activeKeysRef.current, keyLabel]);

      setLiveKeys(Array.from(active));
      lastUpdateRef.current = Date.now();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) finalizeEntry("Left Click");
      if (e.button === 2) finalizeEntry("Right Click");
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        finalizeEntry(e.deltaY < 0 ? "Zoom In" : "Zoom Out");
      } else {
        finalizeEntry(e.deltaY < 0 ? "Scroll Up" : "Scroll Down");
      }
    };

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const active = activeKeysRef.current;
      if (active.size > 0 && now - lastUpdateRef.current > CLEANUP_TIMEOUT) {
        // finalize current combo before clearing
        finalizeEntry(Array.from(active));
        activeKeysRef.current.clear();
        setLiveKeys([]);
      }
    }, 500);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("wheel", handleWheel);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div className={styles.keyOverlay}>
      {/* Current live keys */}
      {liveKeys.length > 0 && (
        <span className={styles.liveEntry}>{liveKeys.join(" + ")}</span>
      )}

      {/* History entries */}
      {history.map((entry) => (
        <span key={entry.id} className={styles.historyEntry}>
          {entry.label}
        </span>
      ))}
    </div>
  );
};

export default KeyOverlay;
