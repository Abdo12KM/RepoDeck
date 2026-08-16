import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/env";

const SESSION_COOKIE = "repodeck-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface AuthSession {
  userId: string;
  githubLogin: string;
  avatarUrl: string | null;
}

function secretKey() {
  return new TextEncoder().encode(env.AUTH_SECRET);
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.githubLogin !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      githubLogin: payload.githubLogin,
      avatarUrl:
        typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
    };
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
