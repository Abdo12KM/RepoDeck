import { describe, expect, it } from "vitest";
import { formatElapsedTime } from "./time";

describe("formatElapsedTime", () => {
  const now = Date.parse("2026-08-15T12:00:00.000Z");

  it("uses whole units for short elapsed times", () => {
    expect(formatElapsedTime(now - 500, now)).toBe("just now");
    expect(formatElapsedTime(now - 1_000, now)).toBe("1s ago");
    expect(formatElapsedTime(now - 50_000, now)).toBe("50s ago");
    expect(formatElapsedTime(now - 59 * 60 * 1000, now)).toBe("59m ago");
  });

  it("keeps the remainder as a second whole unit", () => {
    expect(formatElapsedTime(now - 95 * 60 * 1000, now)).toBe("1h 35m ago");
    expect(formatElapsedTime(now - (24 + 1) * 60 * 60 * 1000, now)).toBe(
      "1d 1h ago",
    );
    expect(formatElapsedTime(now - (6 * 24 + 7) * 60 * 60 * 1000, now)).toBe(
      "6d 7h ago",
    );
    expect(
      formatElapsedTime(now - (3 * 7 + 6) * 24 * 60 * 60 * 1000, now),
    ).toBe("3w 6d ago");
    expect(formatElapsedTime(now - 45 * 24 * 60 * 60 * 1000, now)).toBe(
      "1mo 2w ago",
    );
  });

  it("handles invalid and future timestamps safely", () => {
    expect(formatElapsedTime("not-a-date", now)).toBe("—");
    expect(formatElapsedTime(now + 10_000, now)).toBe("just now");
  });
});
