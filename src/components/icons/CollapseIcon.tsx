// CollapseIcon.tsx
import React from "react";

interface CollapseIconProps {
  direction: "left" | "right";
  size?: number;
  color?: string;
}

const CollapseIcon: React.FC<CollapseIconProps> = ({ direction, size = 12, color = "#333" }) => {
  const transform = direction === "left" ? "rotate(180 8 8)" : "";

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <polygon
        points="6,4 11,8 6,12"
        fill={color}
        transform={transform}
      />
    </svg>
  );
};

export default CollapseIcon;
