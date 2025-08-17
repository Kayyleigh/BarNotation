import React, { useRef, useState } from "react";
import "./tooltip.css";

type TooltipProps = {
  text: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ text, style, children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();

    if (rect && tooltipRect) {
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

      // Clamp to viewport horizontally
      left = Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4));

      let top = rect.bottom + 6;

      // Optionally clamp to viewport vertically (tooltip won't go off bottom)
      if (top + tooltipRect.height > window.innerHeight) {
        top = rect.top - tooltipRect.height - 6; // show above if not enough space
      }

      setCoords({ top, left });
    }
  };

  const hideTooltip = () => {
    setCoords(null);
  };

  return (
    <>
      <div
        className="tooltip-wrapper"
        style={style}
        ref={wrapperRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {/* Render tooltip always but hide if no coords */}
      <div
        ref={tooltipRef}
        className="tooltip-fixed"
        style={{
          top: coords?.top ?? -9999,
          left: coords?.left ?? -9999,
        }}
      >
        {text}
      </div>
    </>
  );
};

export default React.memo(Tooltip);
