import React, { useState, useEffect, useCallback } from "react";
import { nodeToLatex } from "../../models/nodeToLatex";
import type { MathNode } from "../../models/types"; // Replace with your actual Node type
import styles from "./LatexViewer.module.css";
import "../../styles/latexOutputColoring.css";

interface LatexViewerProps {
  rootNode: MathNode;
  showLatex: boolean;
}

const LatexViewer: React.FC<LatexViewerProps> = ({ rootNode, showLatex }) => {
  const [latex, setLatex] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isOutdated, setIsOutdated] = useState(true);
  const [copied, setCopied] = useState(false);

  const refreshLatex = useCallback(() => {
    setLatex("Refreshing...");
    setTimeout(() => {
      try {
        const latexCode = nodeToLatex(rootNode, true);
        setLatex(latexCode);
        setLastRefreshed(new Date());
        setIsOutdated(false);
        setCopied(false);
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setLatex("⚠ Error generating LaTeX");
      }
    }, 250);
  }, [rootNode]);
  
  useEffect(() => {
    setIsOutdated(true);
  }, [rootNode]);

  //// UGGH I cannot get it to only refresh ON TOGGLE (without lot of coding for so small shit)
  // useEffect(() => {
  //   if (showLatex) {
  //     refreshLatex();
  //   }
  // }, [showLatex, refreshLatex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(nodeToLatex(rootNode, false)); // Non-styled version
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const timeString = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false  // forces 24-hour format
      })
    : "Never";

    return (
      <div className={`${styles.latexViewer} ${showLatex ? "" : styles.hide}`}>
        <div className={styles.latexHeader}>
          <button
            onClick={refreshLatex}
            className={`${styles.refreshButton} ${isOutdated ? styles.outdated : styles.fresh}`}
          >
            {isOutdated ? "⟲ Refresh LaTeX*" : "✓ Refreshed LaTeX"}
          </button>
          <span className={styles.latexTimestamp}>Last refreshed: {timeString}</span>
        </div>
    
        <div className={styles.latexBoxWrapper}>
          <pre
            className={`${styles.latexBox} ${latex === "Refreshing..." ? styles.latexRefreshing : ""}`}
            dangerouslySetInnerHTML={{
              __html:
                latex === "Refreshing..."
                  ? latex // Just plain text (escaped)
                  : latex,
            }}
          />
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? "✔ Copied" : "📋 Copy"}
          </button>
        </div>
      </div>
    );    
};

export default LatexViewer;
