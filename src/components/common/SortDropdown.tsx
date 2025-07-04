// components/common/SortDropdown.tsx
import styles from "./SortDropdown.module.css"; // optional default styles

export interface SortOption<T extends string> {
  label: string;
  value: T;
}

interface SortDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  className?: string; // for custom style overrides
  tooltip?: string;
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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${styles.sortDropdown} ${className}`}
      title={tooltip}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
