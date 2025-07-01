import React from "react";
import styles from "./SearchBar.module.css"; // or use a shared style
import Tooltip from "../tooltips/Tooltip";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  tooltip = "Search",
  className = "",
}) => {
  return (
    <Tooltip text={tooltip} style={{ width: "100%" }}>
      <div className={`${styles.searchBar} ${className}`}>
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className={styles.clearButton}
            onClick={() => onChange("")}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </Tooltip>
  );
};

export default SearchBar;
