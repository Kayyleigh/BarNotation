// components/common/SearchBar.tsx
import React from "react";
import styles from "./SearchBar.module.css";
import Tooltip from "../tooltips/Tooltip";
import { useI18n } from "../../i18n/useI18n";

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
  placeholder,
  tooltip,
  className = "",
}) => {
  const { t } = useI18n(); // Use language hook

  return (
    <Tooltip text={tooltip || t("search.tooltip")} style={{ width: "100%" }}>
      <div className={`${styles.searchBar} ${className}`}>
        <input
          placeholder={placeholder || t("search.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className={styles.clearButton}
            onClick={() => onChange("")}
            title={t("searchbar.clear")}
          >
            ×
          </button>
        )}
      </div>
    </Tooltip>
  );
};

export default SearchBar;