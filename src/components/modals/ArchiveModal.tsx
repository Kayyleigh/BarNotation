import React from "react";
import styles from "./ArchiveModal.module.css";
import SearchBar from "../common/SearchBar";
import { SortDropdown } from "../common/SortDropdown";
import { useI18n } from "../../i18n/useI18n";

interface ArchiveModalProps<T, SortVal extends string> {
  title: string;
  search: string;
  onSearchChange: (s: string) => void;
  sortValue: SortVal;
  onSortChange: (val: SortVal) => void;
  sortOptions: { label: string; value: SortVal }[];
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  searchTooltip?: string;
  searchPlaceholder?: string;
}

function ArchiveModal<T, SortVal extends string>({
  title,
  search,
  onSearchChange,
  sortValue,
  onSortChange,
  sortOptions,
  items,
  renderItem,
  emptyMessage,
  searchTooltip,
  searchPlaceholder,
}: ArchiveModalProps<T, SortVal>) {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <h2>{title}</h2>

      <div className={styles.controls}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          tooltip={searchTooltip}
          placeholder={searchPlaceholder ?? t("modals.archiveModal.searchPlaceholder")}
          className={styles.searchBar}
        />

        <SortDropdown
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
          className={styles.sortDropdown}
        />
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          {emptyMessage ?? t("modals.archiveModal.noItemsFound")}
        </p>
      ) : (
        <ul className={styles.list}>{items.map(renderItem)}</ul>
      )}
    </div>
  );
}

export default ArchiveModal;