// // components/modals/LibCollectionArchiveModal.tsx
// import React, { useState, useMemo } from "react";
// import type { LibraryCollection } from "../../models/libraryTypes";
// import ArchiveModal from "./ArchiveModal";
// import MathView from "../mathExpression/MathView";
// import archiveStyles from "./ArchiveModal.module.css";
// import collectionArchiveStyles from "./LibCollectionArchiveModal.module.css";
// import { formatArchivedAt, formatCreatedAt } from "../../utils/dateUtils";
// import Tooltip from "../tooltips/Tooltip";
// import clsx from "clsx";
// import Modal from "./Modal";

// type LibraryCollectionSortKey = "created" | "archived" | "name" | "entryCount";
// type SortDirection = "asc" | "desc";
// type SortValue = `${LibraryCollectionSortKey}_${SortDirection}`;

// interface Props {
//   archived: LibraryCollection[];
//   onClose: () => void;
//   onUnarchive: (id: string) => void;
//   onDelete: (id: string) => void;
// }

// const sortOptions: { label: string; value: SortValue }[] = [
//   { label: "Recently Archived", value: "archived_desc" },
//   { label: "Longest Archived", value: "archived_asc" },
//   { label: "Newest Collection", value: "created_desc" },
//   { label: "Oldest Collection", value: "created_asc" },
//   { label: "Name A → Z", value: "name_desc" },
//   { label: "Name Z → A", value: "name_asc" },
//   { label: "Most Entries", value: "entryCount_desc" },
//   { label: "Fewest Entries", value: "entryCount_asc" },
// ];

// const LibCollectionArchiveModal: React.FC<Props> = ({
//   archived,
//   onClose,
//   onUnarchive,
//   onDelete,
// }) => {
//   const [search, setSearch] = useState("");
//   const [sortValue, setSortValue] = useState<SortValue>("archived_desc");
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const filtered = useMemo(() => {
//     const [key, dir] = sortValue.split("_") as [LibraryCollectionSortKey, SortDirection];

//     const baseSort: Record<LibraryCollectionSortKey, (a: LibraryCollection, b: LibraryCollection) => number> = {
//       created: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
//       archived: (a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0),
//       name: (a, b) => a.name.localeCompare(b.name),
//       entryCount: (a, b) => b.entries.length - a.entries.length,
//     };

//     const sortFn = baseSort[key];
//     return [...archived]
//       .filter((col) => col.name.toLowerCase().includes(search.toLowerCase()))
//       .sort((a, b) => (dir === "asc" ? -sortFn(a, b) : sortFn(a, b)));
//   }, [archived, search, sortValue]);

//   const previewTooltip = (col: LibraryCollection, expandedId: string | null): string =>
//     col.entries.length === 0
//       ? "No entries to show"
//       : expandedId === col.id
//         ? "Hide preview"
//         : "View collection entries";

//   return (
//     <Modal onClose={onClose}>
//       <ArchiveModal
//         title="Archived Collections"
//         search={search}
//         onSearchChange={setSearch}
//         searchPlaceholder="Search archived collections..."
//         searchTooltip="Search by collection name"
//         sortValue={sortValue}
//         onSortChange={(val) => setSortValue(val as SortValue)}
//         sortOptions={sortOptions}
//         items={filtered}
//         emptyMessage="No matching collections."
//         renderItem={(col) => (
//           <li key={col.id} className={archiveStyles.item}>
//             <div className={archiveStyles.header}>
//               <div>
//                 <div className={archiveStyles.metaLine}>
//                   <strong>{col.name}</strong>
//                   <span className={archiveStyles.dot}>·</span>
//                   <span className={archiveStyles.entries}>
//                     {col.entries.length} entr{col.entries.length === 1 ? "y" : "ies"}
//                   </span>
//                 </div>

//                 <div className={archiveStyles.dateLine}>
//                   {col.archivedAt && (
//                     <time
//                       dateTime={new Date(col.archivedAt).toISOString()}
//                       title={`Archived at ${new Date(col.archivedAt).toLocaleString()}`}
//                     >
//                       {formatArchivedAt(col.archivedAt)}
//                     </time>
//                   )}
//                   {col.createdAt && col.archivedAt && <span>, </span>}
//                   {col.createdAt && (
//                     <time
//                       dateTime={new Date(col.createdAt).toISOString()}
//                       title={`Created at ${new Date(col.createdAt).toLocaleString()}`}
//                     >
//                       {formatCreatedAt(col.createdAt)}
//                     </time>
//                   )}
//                 </div>
//               </div>
//               <div className={archiveStyles.actions}>
//                 <Tooltip text={previewTooltip(col, expandedId)}>
//                   <button
//                     onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
//                     className={archiveStyles.previewToggle}
//                     disabled={col.entries.length === 0}
//                   >
//                     {expandedId === col.id ? "Hide" : "Preview"}
//                   </button>
//                 </Tooltip>
//                 <Tooltip text="Restore collection">
//                   <button onClick={() => onUnarchive(col.id)}>Restore</button>
//                 </Tooltip>
//                 <Tooltip text="Permanently delete collection">
//                   <button
//                     className={clsx("button", "delete-button")}
//                     onClick={() => {
//                       if (confirm(`Delete "${col.name}" permanently?`)) {
//                         onDelete(col.id);
//                       }
//                     }}
//                   >
//                     🗑️
//                   </button>
//                 </Tooltip>
//               </div>
//             </div>

//             {expandedId === col.id && (
//               <div className={collectionArchiveStyles.preview}>
//                 {col.entries.length === 0 ? (
//                   <p className={collectionArchiveStyles.emptyPreview}>No entries.</p>
//                 ) : (
//                   <div className={collectionArchiveStyles.previewEntries}>
//                     {col.entries.map((e) => (
//                       <div key={e.id} className={collectionArchiveStyles.previewEntry}>
//                         <MathView node={e.node} />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </li>
//         )}
//       />
//     </Modal>
//   );
// };

// export default LibCollectionArchiveModal;

import React, { useState, useMemo } from "react";
import type { LibraryCollection } from "../../models/libraryTypes";
import ArchiveModal from "./ArchiveModal";
import MathView from "../mathExpression/MathView";
import archiveStyles from "./ArchiveModal.module.css";
import collectionArchiveStyles from "./LibCollectionArchiveModal.module.css";
import { formatArchivedAt, formatCreatedAt } from "../../utils/dateUtils";
import Tooltip from "../tooltips/Tooltip";
import clsx from "clsx";
import Modal from "./Modal";
import { useI18n } from "../../i18n/useI18n";

type LibraryCollectionSortKey = "created" | "archived" | "name" | "entryCount";
type SortDirection = "asc" | "desc";
type SortValue = `${LibraryCollectionSortKey}_${SortDirection}`;

interface Props {
  archived: LibraryCollection[];
  onClose: () => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const LibCollectionArchiveModal: React.FC<Props> = ({
  archived,
  onClose,
  onUnarchive,
  onDelete,
}) => {
  const { t } = useI18n();

  const sortOptions: { label: string; value: SortValue }[] = [
    { label: t("modals.collectionArchive.sort.archived_desc"), value: "archived_desc" },
    { label: t("modals.collectionArchive.sort.archived_asc"), value: "archived_asc" },
    { label: t("modals.collectionArchive.sort.created_desc"), value: "created_desc" },
    { label: t("modals.collectionArchive.sort.created_asc"), value: "created_asc" },
    { label: t("modals.collectionArchive.sort.name_desc"), value: "name_desc" },
    { label: t("modals.collectionArchive.sort.name_asc"), value: "name_asc" },
    { label: t("modals.collectionArchive.sort.entryCount_desc"), value: "entryCount_desc" },
    { label: t("modals.collectionArchive.sort.entryCount_asc"), value: "entryCount_asc" },
  ];

  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("archived_desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const [key, dir] = sortValue.split("_") as [LibraryCollectionSortKey, SortDirection];

    const baseSort: Record<LibraryCollectionSortKey, (a: LibraryCollection, b: LibraryCollection) => number> = {
      created: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
      archived: (a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0),
      name: (a, b) => a.name.localeCompare(b.name),
      entryCount: (a, b) => b.entries.length - a.entries.length,
    };

    const sortFn = baseSort[key];
    return [...archived]
      .filter((col) => col.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (dir === "asc" ? -sortFn(a, b) : sortFn(a, b)));
  }, [archived, search, sortValue]);

  const previewTooltip = (col: LibraryCollection, expandedId: string | null): string =>
    col.entries.length === 0
      ? t("modals.collectionArchive.tooltip.noEntries")
      : expandedId === col.id
        ? t("modals.collectionArchive.tooltip.hide")
        : t("modals.collectionArchive.tooltip.view");

  return (
    <Modal onClose={onClose}>
      <ArchiveModal
        title={t("modals.collectionArchive.title")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("modals.collectionArchive.searchPlaceholder")}
        searchTooltip={t("modals.collectionArchive.searchTooltip")}
        sortValue={sortValue}
        onSortChange={(val) => setSortValue(val as SortValue)}
        sortOptions={sortOptions}
        items={filtered}
        emptyMessage={t("modals.collectionArchive.noMatching")}
        renderItem={(col) => (
          <li key={col.id} className={archiveStyles.item}>
            <div className={archiveStyles.header}>
              <div>
                <div className={archiveStyles.metaLine}>
                  <strong>{col.name}</strong>
                  <span className={archiveStyles.dot}>·</span>
                  <span className={archiveStyles.entries}>
                    {col.entries.length}{" "}
                    {col.entries.length === 1
                      ? t("modals.collectionArchive.entry")
                      : t("modals.collectionArchive.entries")}
                  </span>
                </div>

                <div className={archiveStyles.dateLine}>
                  {col.archivedAt && (
                    <time
                      dateTime={new Date(col.archivedAt).toISOString()}
                      title={`${t("modals.collectionArchive.archivedAt")} ${new Date(col.archivedAt).toLocaleString()}`}
                    >
                      {formatArchivedAt(col.archivedAt)}
                    </time>
                  )}
                  {col.createdAt && col.archivedAt && <span>, </span>}
                  {col.createdAt && (
                    <time
                      dateTime={new Date(col.createdAt).toISOString()}
                      title={`${t("modals.collectionArchive.createdAt")} ${new Date(col.createdAt).toLocaleString()}`}
                    >
                      {formatCreatedAt(col.createdAt)}
                    </time>
                  )}
                </div>
              </div>
              <div className={archiveStyles.actions}>
                <Tooltip text={previewTooltip(col, expandedId)}>
                  <button
                    onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                    className={archiveStyles.previewToggle}
                    disabled={col.entries.length === 0}
                  >
                    {expandedId === col.id
                      ? t("modals.collectionArchive.hide")
                      : t("modals.collectionArchive.preview")}
                  </button>
                </Tooltip>
                <Tooltip text={t("modals.collectionArchive.restoreTooltip")}>
                  <button onClick={() => onUnarchive(col.id)}>
                    {t("modals.collectionArchive.restore")}
                  </button>
                </Tooltip>
                <Tooltip text={t("modals.collectionArchive.deleteTooltip")}>
                  <button
                    className={clsx("button", "delete-button")}
                    onClick={() => {
                      if (confirm(`${t("modals.collectionArchive.deleteConfirm")} "${col.name}"?`)) {
                        onDelete(col.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </Tooltip>
              </div>
            </div>

            {expandedId === col.id && (
              <div className={collectionArchiveStyles.preview}>
                {col.entries.length === 0 ? (
                  <p className={collectionArchiveStyles.emptyPreview}>
                    {t("modals.collectionArchive.noEntries")}
                  </p>
                ) : (
                  <div className={collectionArchiveStyles.previewEntries}>
                    {col.entries.map((e) => (
                      <div key={e.id} className={collectionArchiveStyles.previewEntry}>
                        <MathView node={e.node} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        )}
      />
    </Modal>
  );
};

export default LibCollectionArchiveModal;
