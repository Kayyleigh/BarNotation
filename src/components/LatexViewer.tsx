import React, { useState, useEffect } from "react";
import { nodeToLatex } from "../models/nodeToLatex";
import type { MathNode } from "../models/types"; // Replace with your actual Node type

interface LatexViewerProps {
  rootNode: MathNode;
}

const LatexViewer: React.FC<LatexViewerProps> = ({ rootNode }) => {
  const [latex, setLatex] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isOutdated, setIsOutdated] = useState(true);
  const [copied, setCopied] = useState(false);

  const refreshLatex = () => {
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
    }, 250); // short feedback delay
  };  

  useEffect(() => {
    setIsOutdated(true);
  }, [rootNode]);

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
      <div className="latex-viewer">
        <div className="latex-header">
          <button
            onClick={refreshLatex}
            className={`refresh-button ${isOutdated ? "outdated" : "fresh"}`}
          >
            {isOutdated ? "⟲ Refresh LaTeX*" : "✓ Refreshed LaTeX"}
          </button>
          <span className="latex-timestamp">Last refreshed: {timeString}</span>
        </div>
    
        <div className="latex-box-wrapper">
          <pre
            className={`latex-box ${latex === "Refreshing..." ? "latex-refreshing" : ""}`}
            dangerouslySetInnerHTML={{
              __html:
                latex === "Refreshing..."
                  ? latex // Just plain text (escaped)
                  : latex,
            }}
          />
          <button className="copy-button" onClick={handleCopy}>
            {copied ? "✔ Copied" : "📋 Copy"}
          </button>
        </div>
      </div>
    );    
};

export default LatexViewer;
