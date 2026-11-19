export function formatPKR(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return "Rs 0";
  if (Math.abs(val) >= 1_000_000) {
    return `Rs ${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `Rs ${(val / 1_000).toFixed(0)}K`;
  }
  return `Rs ${val.toLocaleString()}`;
}

export function formatPKRFull(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return "Rs 0";
  return `Rs ${Math.round(val).toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
