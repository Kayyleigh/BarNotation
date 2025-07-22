// components/mathExpression/LatexViewer.tsx
import React, { useState, useEffect, useRef } from "react";
import { nodeToLatex } from "../../models/nodeToLatex";
import type { MathNode } from "../../models/types";
import styles from "./LatexViewer.module.css";
import "../../styles/latexOutputColoring.css";
import { useLatexRefreshSignal } from "../../hooks/latexViewRefresh/useLatexRefresh";

interface LatexViewerProps {
  rootNode: MathNode;
  showLatex: boolean;
}

const LatexViewer: React.FC<LatexViewerProps> = ({ rootNode, showLatex }) => {
  const [latex, setLatex] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isOutdated, setIsOutdated] = useState(true);
  const [copied, setCopied] = useState(false);

  const signal = useLatexRefreshSignal();
  const prevShowLatex = useRef(showLatex);
  const latestRootNode = useRef(rootNode);

  useEffect(() => {
    latestRootNode.current = rootNode;
    setIsOutdated(true);
  }, [rootNode]);

  const refreshLatex = () => {
    setLatex("Refreshing...");
    setTimeout(() => {
      try {
        const latexCode = nodeToLatex(latestRootNode.current, true);
        setLatex(latexCode);
        setLastRefreshed(new Date());
        setIsOutdated(false);
        setCopied(false);
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setLatex("⚠ Error generating LaTeX");
      }
    }, 250);
  };

  useEffect(() => {
    if (!prevShowLatex.current && showLatex) {
      refreshLatex();
    }
    prevShowLatex.current = showLatex;
  }, [showLatex]);

  useEffect(() => {
    // Respond to global refresh signal only
    setLatex("Refreshing...");
    setTimeout(() => {
      try {
        const latexCode = nodeToLatex(latestRootNode.current, true);
        setLatex(latexCode);
        setLastRefreshed(new Date());
        setIsOutdated(false);
        setCopied(false);
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setLatex("⚠ Error generating LaTeX");
      }
    }, 250);
  }, [signal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(nodeToLatex(latestRootNode.current, false));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const timeString = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "Never";

  return (
    <div className={`${styles.latexViewer} ${showLatex ? "" : styles.hide}`}>
      <div className={styles.latexHeader}>
        <button
          onClick={refreshLatex}
          className={`${styles.refreshButton} ${
            isOutdated ? styles.outdated : styles.fresh
          }`}
        >
          {isOutdated ? "⟲ Refresh LaTeX*" : "✓ Refreshed LaTeX"}
        </button>
        <span className={styles.latexTimestamp}>Last refreshed: {timeString}</span>
      </div>

      <div className={styles.latexBoxWrapper}>
        <pre
          className={`${styles.latexBox} ${
            latex === "Refreshing..." ? styles.latexRefreshing : ""
          }`}
          dangerouslySetInnerHTML={{ __html: latex }}
        />
        <button className={styles.copyButton} onClick={handleCopy}>
          {copied ? "✔ Copied" : "📋 Copy"}
        </button>
      </div>
    </div>
  );
};

export default LatexViewer;
