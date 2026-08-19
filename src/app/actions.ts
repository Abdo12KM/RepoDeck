"use server";

import { and, count, eq, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/env";
import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { pushRateLimits, pushSubscriptions } from "@/lib/db/schema";
import {
  isAllowedPushEndpoint,
  normalizeNotificationPath,
  sendWebPush,
  WebPushError,
} from "@/lib/pwa/web-push";

const MAX_PUSH_SUBSCRIPTIONS_PER_USER = 30;
const TEST_PUSHES_PER_MINUTE = 5;

const subscriptionSchema = z.object({
  endpoint: z.url().refine(isAllowedPushEndpoint, "Unsupported push endpoint"),
  expirationTime: z.number().int().nonnegative().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(16),
    auth: z.string().min(8),
  }),
});

const endpointSchema = z
  .url()
  .refine(isAllowedPushEndpoint, "Unsupported push endpoint");
const messageSchema = z.string().trim().min(1).max(140);
const targetUrlSchema = z.string().max(2048);

export type PushActionCode =
  | "AUTH_REQUIRED"
  | "INVALID_INPUT"
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "OWNERSHIP_CONFLICT"
  | "DEVICE_LIMIT"
  | "RATE_LIMITED"
  | "SEND_FAILED";

export type PushActionResult =
  | { success: true }
  | { success: false; code: PushActionCode; error: string };

export type PushOwnershipResult =
  | { success: true; ownedByCurrentUser: boolean }
  | { success: false; code: PushActionCode; error: string };

function pushConfig() {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  const subject = env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
}

async function consumeTestPushRateLimit(userId: string): Promise<boolean> {
  // PostgreSQL owns the clock so every serverless/app instance uses the exact
  // same minute boundary and retention cutoff.
  const windowStart = sql<Date>`date_trunc('minute', now())`;

  const [bucket] = await db
    .insert(pushRateLimits)
    .values({
      userId,
      windowStart,
      count: 1,
      updatedAt: sql<Date>`now()`,
    })
    .onConflictDoUpdate({
      target: [pushRateLimits.userId, pushRateLimits.windowStart],
      set: {
        count: sql`${pushRateLimits.count} + 1`,
        updatedAt: sql<Date>`now()`,
      },
    })
    .returning({ count: pushRateLimits.count });

  await db
    .delete(pushRateLimits)
    .where(
      lt(pushRateLimits.windowStart, sql<Date>`now() - interval '24 hours'`),
    );

  return (
    (bucket?.count ?? TEST_PUSHES_PER_MINUTE + 1) <= TEST_PUSHES_PER_MINUTE
  );
}

async function pruneStalePushSubscriptions(userId: string): Promise<void> {
  // Expired browser subscriptions are always stale. For subscriptions without
  // an explicit browser expiry, one year without a refresh or successful send
  // is conservative enough to prevent abandoned devices from permanently
  // consuming the per-account cap.
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        or(
          lt(
            pushSubscriptions.expirationTime,
            sql<number>`(extract(epoch from now()) * 1000)::bigint`,
          ),
          lt(
            pushSubscriptions.lastSeenAt,
            sql<Date>`now() - interval '1 year'`,
          ),
        ),
      ),
    );
}

export async function getPushSubscriptionStatus(
  endpoint: string,
): Promise<PushOwnershipResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      success: false,
      code: "AUTH_REQUIRED",
      error: "Sign in before checking notification settings.",
    };
  }

  const parsed = endpointSchema.safeParse(endpoint);
  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: "Invalid push subscription endpoint.",
    };
  }

  const [subscription] = await db
    .select({ userId: pushSubscriptions.userId })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, parsed.data))
    .limit(1);

  const ownedByCurrentUser = subscription?.userId === session.userId;

  if (ownedByCurrentUser) {
    await db
      .update(pushSubscriptions)
      .set({
        lastSeenAt: sql<Date>`now()`,
        updatedAt: sql<Date>`now()`,
      })
      .where(
        and(
          eq(pushSubscriptions.endpoint, parsed.data),
          eq(pushSubscriptions.userId, session.userId),
        ),
      );
  }

  return { success: true, ownedByCurrentUser };
}

export async function subscribeUser(input: unknown): Promise<PushActionResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      success: false,
      code: "AUTH_REQUIRED",
      error: "Sign in with GitHub before enabling notifications.",
    };
  }

  if (!pushConfig()) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      error: "Push notifications are not configured on this deployment.",
    };
  }

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: "The browser returned an invalid push subscription.",
    };
  }

  const subscription = parsed.data;
  const [existing] = await db
    .select({ userId: pushSubscriptions.userId })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
    .limit(1);

  if (existing && existing.userId !== session.userId) {
    return {
      success: false,
      code: "OWNERSHIP_CONFLICT",
      error:
        "This browser subscription belongs to another RepoDeck account. Disable it and enable notifications again.",
    };
  }

  if (existing) {
    await db
      .update(pushSubscriptions)
      .set({
        expirationTime: subscription.expirationTime ?? null,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        lastSeenAt: sql<Date>`now()`,
        updatedAt: sql<Date>`now()`,
      })
      .where(
        and(
          eq(pushSubscriptions.endpoint, subscription.endpoint),
          eq(pushSubscriptions.userId, session.userId),
        ),
      );

    return { success: true };
  }

  await pruneStalePushSubscriptions(session.userId);

  const [subscriptionCount] = await db
    .select({ value: count() })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.userId));

  if ((subscriptionCount?.value ?? 0) >= MAX_PUSH_SUBSCRIPTIONS_PER_USER) {
    return {
      success: false,
      code: "DEVICE_LIMIT",
      error:
        "This account has reached its notification-device limit. Remove an older subscription before adding another browser.",
    };
  }

  const inserted = await db
    .insert(pushSubscriptions)
    .values({
      endpoint: subscription.endpoint,
      userId: session.userId,
      expirationTime: subscription.expirationTime ?? null,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    })
    .onConflictDoNothing({ target: pushSubscriptions.endpoint })
    .returning({ endpoint: pushSubscriptions.endpoint });

  if (inserted.length === 0) {
    // Resolve a concurrent insert without ever transferring endpoint ownership.
    const [winner] = await db
      .select({ userId: pushSubscriptions.userId })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (!winner || winner.userId !== session.userId) {
      return {
        success: false,
        code: "OWNERSHIP_CONFLICT",
        error:
          "This browser subscription belongs to another RepoDeck account. Disable it and enable notifications again.",
      };
    }

    await db
      .update(pushSubscriptions)
      .set({
        expirationTime: subscription.expirationTime ?? null,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        lastSeenAt: sql<Date>`now()`,
        updatedAt: sql<Date>`now()`,
      })
      .where(
        and(
          eq(pushSubscriptions.endpoint, subscription.endpoint),
          eq(pushSubscriptions.userId, session.userId),
        ),
      );
  }

  return { success: true };
}

export async function unsubscribeUser(
  endpoint: string,
): Promise<PushActionResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      success: false,
      code: "AUTH_REQUIRED",
      error: "Sign in before changing notification settings.",
    };
  }

  const parsed = endpointSchema.safeParse(endpoint);
  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: "Invalid push subscription endpoint.",
    };
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, parsed.data),
        eq(pushSubscriptions.userId, session.userId),
      ),
    );

  return { success: true };
}

export async function sendNotification(
  endpoint: string,
  message: string,
  targetUrl = "/repositories",
): Promise<PushActionResult> {
  const session = await getAuthSession();
  if (!session) {
    return {
      success: false,
      code: "AUTH_REQUIRED",
      error: "Sign in before sending a test notification.",
    };
  }

  const config = pushConfig();
  if (!config) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      error: "Push notifications are not configured on this deployment.",
    };
  }

  const parsedEndpoint = endpointSchema.safeParse(endpoint);
  const parsedMessage = messageSchema.safeParse(message);
  const parsedTargetUrl = targetUrlSchema.safeParse(targetUrl);
  const normalizedTargetUrl = parsedTargetUrl.success
    ? normalizeNotificationPath(parsedTargetUrl.data)
    : null;

  if (
    !parsedEndpoint.success ||
    !parsedMessage.success ||
    !normalizedTargetUrl
  ) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: "Invalid push notification request.",
    };
  }

  const [subscription] = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, parsedEndpoint.data),
        eq(pushSubscriptions.userId, session.userId),
      ),
    )
    .limit(1);

  if (!subscription) {
    return {
      success: false,
      code: "NOT_FOUND",
      error: "This browser is not subscribed for the current account.",
    };
  }

  if (!(await consumeTestPushRateLimit(session.userId))) {
    return {
      success: false,
      code: "RATE_LIMITED",
      error: "Too many test notifications. Try again in about a minute.",
    };
  }

  try {
    await sendWebPush(
      subscription,
      JSON.stringify({
        title: "RepoDeck",
        body: parsedMessage.data,
        url: normalizedTargetUrl,
        tag: "repodeck-test",
      }),
      config,
    );

    await db
      .update(pushSubscriptions)
      .set({
        lastSeenAt: sql<Date>`now()`,
        updatedAt: sql<Date>`now()`,
      })
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    return { success: true };
  } catch (error) {
    if (
      error instanceof WebPushError &&
      [404, 410].includes(error.statusCode)
    ) {
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
    }

    console.error("Error sending push notification:", error);
    return {
      success: false,
      code: "SEND_FAILED",
      error: "The push service could not deliver the notification.",
    };
  }
}
