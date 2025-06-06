import React, { useRef, useState } from "react";
import "./tooltip.css";

type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const hideTooltip = () => {
    setCoords(null);
  };

  return (
    <>
      <div
        className="tooltip-wrapper"
        ref={wrapperRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {coords && (
        <div
          className="tooltip-fixed"
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

export default Tooltip;
