// components/mathExpression/LatexViewer.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./LatexViewer.module.css";
import "../../styles/latexOutputColoring.css";
import { useI18n } from "../../i18n/useI18n";

interface LatexViewerProps {
  showLatex: boolean;
  /** Must be stable (e.g., via useCallback in CellRenderer) */
  getLatex: () => string;
  contentVersion: number;
}

const LatexViewer: React.FC<LatexViewerProps> = React.memo(({ showLatex, getLatex, contentVersion }) => {
  const { t } = useI18n();

  // Latest LaTeX string (internal, only updates on refresh)
  const [displayedLatex, setDisplayedLatex] = useState<string>(getLatex());
  const latestLatex = useRef<string>(getLatex());

  // Track whether underlying content has changed without refresh
  const [isOutdated, setIsOutdated] = useState(false);

  // Track timestamp of last refresh
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Track copy status
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsOutdated(true);
  }, [contentVersion]);

  const refreshLatex = useCallback(() => {
    setDisplayedLatex(t("latex.refreshing"));
    setTimeout(() => {
      try {
        const currentLatex = getLatex();
        latestLatex.current = currentLatex;
        setDisplayedLatex(currentLatex);
        setIsOutdated(false);
        setLastRefreshed(new Date());
      } catch (err) {
        console.warn("LaTeX generation failed:", err);
        setDisplayedLatex(t("latex.error"));
      }
    }, 250);
  }, [getLatex, t]);

  const handleCopy = useCallback(() => {
    const latexHtml = latestLatex.current; // your HTML string
    const temp = document.createElement("div");
    temp.innerHTML = latexHtml;
    const textOnly = temp.textContent || ""; // this removes all HTML tags
    navigator.clipboard.writeText(textOnly);

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

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
          className={`${styles.refreshButton} ${isOutdated ? styles.outdated : styles.fresh}`}
        >
          {isOutdated ? t("latex.refreshPrompt") : t("latex.freshPrompt")}
        </button>
        <span className={styles.latexTimestamp}>
          {t("latex.lastRefreshed")}: {timeString}
        </span>
      </div>

      <div className={styles.latexBoxWrapper}>
        <pre
          className={`${styles.latexBox} ${displayedLatex === "" ? styles.latexRefreshing : ""
            }`}
          dangerouslySetInnerHTML={{ __html: displayedLatex }}
        />
        <button className={styles.copyButton} onClick={handleCopy}>
          {copied ? t("latex.copied") : t("latex.copy")}
        </button>
      </div>
    </div>
  );
});

export default LatexViewer;
