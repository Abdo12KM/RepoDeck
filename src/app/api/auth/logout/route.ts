import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { clearAuthSession, getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { isAllowedPushEndpoint } from "@/lib/pwa/web-push";

export async function POST(request: Request) {
  const session = await getAuthSession();

  try {
    const body = (await request.json().catch(() => null)) as {
      endpoint?: unknown;
    } | null;
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : null;

    if (session && endpoint && isAllowedPushEndpoint(endpoint)) {
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, session.userId),
            eq(pushSubscriptions.endpoint, endpoint),
          ),
        );
    }
  } catch (error) {
    // Auth logout must remain available even when push cleanup has a transient
    // failure. The browser will still unsubscribe locally on a best-effort basis.
    console.error("Push subscription revocation during logout failed:", error);
  } finally {
    await clearAuthSession();
  }

  return NextResponse.json({ success: true });
}
