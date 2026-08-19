import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({ sendNotification: vi.fn() }));
vi.mock("web-push", () => ({
  default: { sendNotification: mocks.sendNotification },
  sendNotification: mocks.sendNotification,
}));

import {
  isAllowedPushEndpoint,
  normalizeNotificationPath,
  sendWebPush,
} from "./web-push";

const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/subscription-id",
  p256dh: "public-key-material",
  auth: "auth-secret",
};
const vapid = {
  subject: "mailto:test@example.com",
  publicKey: "public-vapid-key",
  privateKey: "private-vapid-key",
};

afterEach(() => {
  mocks.sendNotification.mockReset();
  delete process.env.PUSH_ENDPOINT_EXTRA_HOSTS;
});

describe("push endpoint policy", () => {
  it("accepts known browser push providers and rejects unsafe endpoints", () => {
    expect(isAllowedPushEndpoint(subscription.endpoint)).toBe(true);
    expect(isAllowedPushEndpoint("http://fcm.googleapis.com/test")).toBe(false);
    expect(isAllowedPushEndpoint("https://example.com/test")).toBe(false);
    expect(
      isAllowedPushEndpoint("https://user:pass@fcm.googleapis.com/test"),
    ).toBe(false);
  });

  it("supports operator-configured additional push hosts", () => {
    process.env.PUSH_ENDPOINT_EXTRA_HOSTS = "push.example.com";
    expect(isAllowedPushEndpoint("https://push.example.com/sub/1")).toBe(true);
  });
});

describe("notification path policy", () => {
  it("keeps same-origin relative paths and rejects external/protocol-relative targets", () => {
    expect(normalizeNotificationPath("/owner/repo?tab=tree#readme")).toBe(
      "/owner/repo?tab=tree#readme",
    );
    expect(normalizeNotificationPath("//evil.example/path")).toBeNull();
    expect(normalizeNotificationPath("https://evil.example/path")).toBeNull();
  });
});

describe("sendWebPush", () => {
  it("validates the endpoint before delegating protocol work to web-push", async () => {
    mocks.sendNotification.mockResolvedValue({ statusCode: 201 });

    await sendWebPush(
      subscription,
      JSON.stringify({ title: "RepoDeck" }),
      vapid,
    );

    expect(mocks.sendNotification).toHaveBeenCalledWith(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify({ title: "RepoDeck" }),
      expect.objectContaining({
        TTL: 60,
        urgency: "normal",
        vapidDetails: vapid,
      }),
    );
  });

  it("never calls web-push for a disallowed endpoint", async () => {
    await expect(
      sendWebPush(
        { ...subscription, endpoint: "https://example.com/push" },
        "payload",
        vapid,
      ),
    ).rejects.toThrow("not an approved browser push service");
    expect(mocks.sendNotification).not.toHaveBeenCalled();
  });

  it("preserves provider status codes for dead-subscription cleanup", async () => {
    mocks.sendNotification.mockRejectedValue({ statusCode: 410, body: "gone" });

    await expect(sendWebPush(subscription, "payload", vapid)).rejects.toEqual(
      expect.objectContaining({
        name: "WebPushError",
        statusCode: 410,
        responseBody: "gone",
      }),
    );
  });
});
