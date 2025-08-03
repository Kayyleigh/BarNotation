// components/mathExpression/LatexViewer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { nodeToLatex } from "../../models/nodeToLatex";
import type { MathNode } from "../../models/mathNodeTypes";
import styles from "./LatexViewer.module.css";
import "../../styles/latexOutputColoring.css";
import { useLatexRefreshSignal } from "../../hooks/latexViewRefresh/useLatexRefresh";
import { useI18n } from "../../i18n/useI18n";

interface LatexViewerProps {
  rootNode: MathNode;
  showLatex: boolean;
}

const LatexViewer: React.FC<LatexViewerProps> = ({ rootNode, showLatex }) => {
  const { t } = useI18n(); // use language hook

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

  const refreshLatex = useCallback(() => {
    setLatex(t("latex.refreshing"));
    setTimeout(() => {
      try {
        const latexCode = nodeToLatex(latestRootNode.current, true);
        setLatex(latexCode);
        setLastRefreshed(new Date());
        setIsOutdated(false);
        setCopied(false);
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setLatex(t("latex.error"));
      }
    }, 250);
  }, [t]);

  // update useEffect that uses refreshLatex:
  useEffect(() => {
    if (!prevShowLatex.current && showLatex) {
      refreshLatex();
    }
    prevShowLatex.current = showLatex;
  }, [showLatex, refreshLatex]);

  useEffect(() => {
    if (!prevShowLatex.current && showLatex) {
      refreshLatex();
    }
    prevShowLatex.current = showLatex;
  }, [refreshLatex, showLatex]);

  useEffect(() => {
    // Respond to global refresh signal only
    setLatex(t("latex.refreshing"));
    setTimeout(() => {
      try {
        const latexCode = nodeToLatex(latestRootNode.current, true);
        setLatex(latexCode);
        setLastRefreshed(new Date());
        setIsOutdated(false);
        setCopied(false);
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setLatex(t("latex.error"));
      }
    }, 250);
  }, [signal, t]);

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
    : t("latex.never");

  return (
    <div className={`${styles.latexViewer} ${showLatex ? "" : styles.hide}`}>
      <div className={styles.latexHeader}>
        <button
          onClick={refreshLatex}
          className={`${styles.refreshButton} ${isOutdated ? styles.outdated : styles.fresh
            }`}
        >
          {isOutdated ? t("latex.refreshPrompt") : t("latex.freshPrompt")}
        </button>
        <span className={styles.latexTimestamp}>
          {t("latex.lastRefreshed")}: {timeString}
        </span>
      </div>

      <div className={styles.latexBoxWrapper}>
        <pre
          className={`${styles.latexBox} ${latex === t("latex.refreshing") ? styles.latexRefreshing : ""
            }`}
          dangerouslySetInnerHTML={{ __html: latex }}
        />
        <button className={styles.copyButton} onClick={handleCopy}>
          {copied ? t("latex.copied") : t("latex.copy")}
        </button>
      </div>
    </div>
  );
};

export default LatexViewer;
