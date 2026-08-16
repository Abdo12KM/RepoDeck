import crypto from "node:crypto";
import { env } from "@/env";

const algorithm = "aes-256-gcm";

function encryptionKey(): Buffer {
  return Buffer.from(env.GITHUB_TOKEN_ENCRYPTION_KEY, "hex");
}

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, encryptedHex] = payload.split(".");
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid encrypted secret");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    encryptionKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
