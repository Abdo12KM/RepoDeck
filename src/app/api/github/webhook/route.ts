import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { revokeInstallation } from "@/lib/auth/github";

function validSignature(body: string, signature: string | null): boolean {
  if (!env.GITHUB_APP_WEBHOOK_SECRET || !signature?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", env.GITHUB_APP_WEBHOOK_SECRET)
    .update(body)
    .digest("hex")}`;
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  const event = request.headers.get("x-github-event");
  const payload = JSON.parse(body) as {
    action?: string;
    installation?: { id?: number };
  };
  const installationId = payload.installation?.id;

  if (event === "installation" && installationId) {
    if (payload.action === "deleted") {
      await revokeInstallation(installationId);
    } else if (payload.action === "suspend") {
      await revokeInstallation(installationId, true);
    } else if (payload.action === "unsuspend") {
      await revokeInstallation(installationId, false);
    }
  }

  return new NextResponse(null, { status: 204 });
}
