// components/common/SortDropdown.tsx
import Tooltip from "../tooltips/Tooltip";
import styles from "./SortDropdown.module.css"; // optional default styles
import { useI18n } from "../../i18n/useI18n"; // import i18n hook

export interface SortOption<T extends string> {
  label: string; // could be a translation key or raw text
  value: T;
}

interface SortDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  className?: string; // for custom style overrides
  tooltip?: string; // can be a translation key or raw text
  "aria-label"?: string;
}

export function SortDropdown<T extends string>({
  value,
  onChange,
  options,
  className = "",
  tooltip,
  ...rest
}: SortDropdownProps<T>) {
  const { t } = useI18n();

  return (
    <Tooltip text={tooltip ? t(tooltip) : t("sortDropdown.sortedBy")}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${styles.sortDropdown} ${className}`}
        title={tooltip ? t(tooltip) : t("sortDropdown.sortedBy")}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {/* If label is a translation key, translate it; otherwise, show raw */}
            {t(opt.label)}
          </option>
        ))}
      </select>
    </Tooltip>
  );
}