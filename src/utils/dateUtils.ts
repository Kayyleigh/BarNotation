// utils/dateUtils.ts
function pluralize(count: number, singular: string, plural = singular + "s") {
    return `${count} ${count === 1 ? singular : plural}`;
}

function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
}

function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
}

export function formatRelativeDate(timestamp: number, label: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 2) {
        return `${label} just now`;
    } else if (diffMinutes < 60) {
        return `${label} ${pluralize(diffMinutes, "minute")} ago`;
    } else if (isSameDay(now, date)) {
        return `${label} ${pluralize(diffHours, "hour")} ago`;
    } else if (isYesterday(date)) {
        return `${label} yesterday`;
    } else if (now.getFullYear() === date.getFullYear()) {
        return (
            `${label} ` +
            date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
            })
        );
    } else {
        return (
            `${label} ` +
            date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
            })
        );
    }
}

// Specific helpers for clarity and consistency in components
export function formatCreatedAt(timestamp: number): string {
    return formatRelativeDate(timestamp, "Created");
}

export function formatModifiedAt(timestamp: number): string {
    return formatRelativeDate(timestamp, "Modified");
}

export function formatArchivedAt(timestamp: number): string {
    return formatRelativeDate(timestamp, "Archived");
}
