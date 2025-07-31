// utils/dateUtils.ts
function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
}

function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
}

export function formatRelativeDate(
    timestamp: number,
    labelKey: string,
    t: (key: string, vars?: { [key: string]: unknown }) => string,
    locale: string
  ): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
  
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
    if (diffMinutes < 1) {
      return `${t(labelKey)} ${t("date.justNow")}`;
    } else if (diffMinutes < 60) {
      return `${t(labelKey)} ${t("date.minuteAgo", { count: diffMinutes })}`;
    } else if (isSameDay(now, date)) {
      return `${t(labelKey)} ${t("date.hourAgo", { count: diffHours })}`;
    } else if (isYesterday(date)) {
      return `${t(labelKey)} ${t("date.yesterday")}`;
    } else if (now.getFullYear() === date.getFullYear()) {
      return (
        `${t(labelKey)} ` +
        date.toLocaleDateString(locale, { month: "short", day: "numeric" })
      );
    } else {
      return (
        `${t(labelKey)} ` +
        date.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    }
  }
  

// Specific helpers for clarity and consistency in components
export function formatCreatedAt(
    timestamp: number,
    t: (key: string, vars?: { [key: string]: unknown }) => string,
    locale: string
  ): string {
    return formatRelativeDate(timestamp, "date.created", t, locale);
  }
  
  export function formatModifiedAt(
    timestamp: number,
    t: (key: string, vars?: { [key: string]: unknown }) => string,
    locale: string
  ): string {
    return formatRelativeDate(timestamp, "date.edited", t, locale);
  }
  
  export function formatArchivedAt(
    timestamp: number,
    t: (key: string, vars?: { [key: string]: unknown }) => string,
    locale: string
  ): string {
    return formatRelativeDate(timestamp, "date.archived", t, locale);
  }
  