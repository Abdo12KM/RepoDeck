import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
  clearAuthSession: vi.fn(),
  deleteSubscription: vi.fn(),
  deleteWhere: vi.fn(),
  isAllowedPushEndpoint: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getAuthSession: mocks.getAuthSession,
  clearAuthSession: mocks.clearAuthSession,
}));

vi.mock("@/lib/db", () => ({
  db: { delete: mocks.deleteSubscription },
}));

vi.mock("@/lib/db/schema", () => ({
  pushSubscriptions: {
    userId: { name: "user_id" },
    endpoint: { name: "endpoint" },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
  and: vi.fn((...conditions: unknown[]) => ({ conditions })),
}));

vi.mock("@/lib/pwa/web-push", () => ({
  isAllowedPushEndpoint: mocks.isAllowedPushEndpoint,
}));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthSession.mockResolvedValue({ userId: "alice" });
  mocks.clearAuthSession.mockResolvedValue(undefined);
  mocks.isAllowedPushEndpoint.mockReturnValue(true);
  mocks.deleteWhere.mockResolvedValue(undefined);
  mocks.deleteSubscription.mockReturnValue({ where: mocks.deleteWhere });
});

describe("POST /api/auth/logout", () => {
  it("revokes the current user endpoint before clearing the session", async () => {
    const response = await POST(
      new Request("https://repodeck.test/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://fcm.googleapis.com/fcm/send/device-1",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.deleteSubscription).toHaveBeenCalledTimes(1);
    expect(mocks.deleteWhere).toHaveBeenCalledTimes(1);
    expect(mocks.clearAuthSession).toHaveBeenCalledTimes(1);
    expect(mocks.deleteWhere.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.clearAuthSession.mock.invocationCallOrder[0],
    );
  });

  it("always clears auth even when push revocation fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.deleteWhere.mockRejectedValueOnce(new Error("database unavailable"));

    const response = await POST(
      new Request("https://repodeck.test/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://fcm.googleapis.com/fcm/send/device-1",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.clearAuthSession).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it("does not attempt server revocation for missing or rejected endpoints", async () => {
    mocks.isAllowedPushEndpoint.mockReturnValue(false);

    await POST(
      new Request("https://repodeck.test/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "https://example.com/not-push" }),
      }),
    );

    expect(mocks.deleteSubscription).not.toHaveBeenCalled();
    expect(mocks.clearAuthSession).toHaveBeenCalledTimes(1);
  });
});
