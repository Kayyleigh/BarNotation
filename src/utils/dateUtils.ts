// utils/dateUtils.ts
export function formatCreatedAt(timestamp: number): string {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInMinutes = diffInMs / (1000 * 60);
  
    if (diffInMinutes < 2) return "Created just now";
  
    return (
      "Created " +
      new Date(timestamp).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }
  