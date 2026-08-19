import "server-only";

import * as webpush from "web-push";

export interface StoredPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface VapidDetails {
  subject: string;
  publicKey: string;
  privateKey: string;
}

const DEFAULT_ALLOWED_PUSH_HOSTS = new Set([
  "fcm.googleapis.com",
  "web.push.apple.com",
  "push.services.mozilla.com",
  "updates.push.services.mozilla.com",
]);

function configuredExtraHosts(): Set<string> {
  return new Set(
    (process.env.PUSH_ENDPOINT_EXTRA_HOSTS ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (url.port && url.port !== "443") return false;

    const hostname = url.hostname.toLowerCase();
    const extraHosts = configuredExtraHosts();

    return (
      DEFAULT_ALLOWED_PUSH_HOSTS.has(hostname) ||
      extraHosts.has(hostname) ||
      hostname.endsWith(".push.apple.com") ||
      hostname.endsWith(".push.services.mozilla.com") ||
      hostname.endsWith(".notify.windows.com")
    );
  } catch {
    return false;
  }
}

export function normalizeNotificationPath(value: string): string | null {
  try {
    if (!value.startsWith("/") || value.startsWith("//")) return null;

    const base = new URL("https://repodeck.invalid/");
    const candidate = new URL(value, base);
    if (candidate.origin !== base.origin) return null;

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return null;
  }
}

export class WebPushError extends Error {
  statusCode: number;
  responseBody: string;

  constructor(statusCode: number, responseBody: string) {
    super(`Push service returned HTTP ${statusCode}`);
    this.name = "WebPushError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export async function sendWebPush(
  subscription: StoredPushSubscription,
  payload: string,
  vapid: VapidDetails,
): Promise<void> {
  if (!isAllowedPushEndpoint(subscription.endpoint)) {
    throw new Error(
      "Push subscription endpoint is not an approved browser push service",
    );
  }

  if (!/^mailto:|^https:\/\//.test(vapid.subject)) {
    throw new Error("VAPID_SUBJECT must be a mailto: or https: URI");
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload,
      {
        TTL: 60,
        urgency: "normal",
        vapidDetails: {
          subject: vapid.subject,
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
        },
      },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      const responseBody =
        "body" in error && typeof error.body === "string" ? error.body : "";
      throw new WebPushError(error.statusCode, responseBody);
    }

    throw error;
  }
}
