/**
 * Parse Year / Number / Name from an ISO standard title for library sorting.
 * Order priority (client): Year (newest first) → Number → Name.
 */
export function parseStandardSortKeys(title: string): {
  year: number;
  number: number;
  numberKey: string;
  name: string;
} {
  const raw = String(title || "").trim();
  const yearMatch = raw.match(/:(\d{4})\b/) || raw.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch
    ? Number(yearMatch[1]?.length === 4 ? yearMatch[1] : yearMatch[0])
    : 0;

  const codeMatch = raw.match(
    /(?:ISO(?:\/IEC)?|IEC)\s*([0-9][0-9A-Za-z.-]*)/i,
  );
  const numberKey = (codeMatch?.[1] || "").replace(/[^0-9A-Za-z.-]/g, "");
  const number = Number((numberKey.match(/\d+/) || ["0"])[0]) || 0;

  return {
    year: Number.isFinite(year) ? year : 0,
    number,
    numberKey: numberKey.toLowerCase(),
    name: raw.toLowerCase(),
  };
}

export function sortStandardsByYearNumberName<T extends { title?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const A = parseStandardSortKeys(a.title || "");
    const B = parseStandardSortKeys(b.title || "");
    if (B.year !== A.year) return B.year - A.year;
    if (A.number !== B.number) return A.number - B.number;
    if (A.numberKey !== B.numberKey) {
      return A.numberKey.localeCompare(B.numberKey, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }
    return A.name.localeCompare(B.name, undefined, { sensitivity: "base" });
  });
}

export function formatStandardMeta(title: string): {
  yearLabel: string;
  numberLabel: string;
  nameLabel: string;
} {
  const keys = parseStandardSortKeys(title);
  const yearLabel = keys.year ? String(keys.year) : "—";
  const numberLabel = keys.numberKey
    ? `ISO ${keys.numberKey.toUpperCase()}`
    : "—";
  const nameWithoutCode = String(title || "")
    .replace(/^(?:ISO(?:\/IEC)?|IEC)\s*[0-9][0-9A-Za-z.-]*(?::\d{4})?\s*[-–—:]?\s*/i, "")
    .trim();
  return {
    yearLabel,
    numberLabel,
    nameLabel: nameWithoutCode || String(title || ""),
  };
}
