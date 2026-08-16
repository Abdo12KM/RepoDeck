const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

/**
 * Formats a timestamp as a short, consistent elapsed-time label.
 * Examples: "just now", "50s ago", "1h 35m ago", "3w 6d ago".
 */
export function formatElapsedTime(
  timestamp: number | string | Date,
  now = Date.now(),
): string {
  const timestampMs = new Date(timestamp).getTime();

  if (!Number.isFinite(timestampMs) || !Number.isFinite(now)) return "—";

  const elapsedMs = Math.max(0, now - timestampMs);
  if (elapsedMs < SECOND_MS) return "just now";
  if (elapsedMs < MINUTE_MS) {
    return `${Math.floor(elapsedMs / SECOND_MS)}s ago`;
  }

  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }

  if (elapsedMs < DAY_MS) {
    return formatCompoundElapsedTime(elapsedMs, HOUR_MS, MINUTE_MS, "h", "m");
  }

  if (elapsedMs < WEEK_MS) {
    return formatCompoundElapsedTime(elapsedMs, DAY_MS, HOUR_MS, "d", "h");
  }

  if (elapsedMs < MONTH_MS) {
    return formatCompoundElapsedTime(elapsedMs, WEEK_MS, DAY_MS, "w", "d");
  }

  if (elapsedMs < YEAR_MS) {
    return formatCompoundElapsedTime(elapsedMs, MONTH_MS, WEEK_MS, "mo", "w");
  }

  return formatCompoundElapsedTime(elapsedMs, YEAR_MS, MONTH_MS, "y", "mo");
}

function formatCompoundElapsedTime(
  elapsedMs: number,
  primaryUnitMs: number,
  secondaryUnitMs: number,
  primarySuffix: string,
  secondarySuffix: string,
): string {
  const primaryValue = Math.floor(elapsedMs / primaryUnitMs);
  const secondaryValue = Math.floor(
    (elapsedMs % primaryUnitMs) / secondaryUnitMs,
  );

  const elapsed =
    secondaryValue > 0
      ? `${primaryValue}${primarySuffix} ${secondaryValue}${secondarySuffix}`
      : `${primaryValue}${primarySuffix}`;

  return `${elapsed} ago`;
}
