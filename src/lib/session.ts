import crypto from "crypto";
import { cookies } from "next/headers";
import { AuthUser } from "@/types";
import { findUserById } from "@/lib/auth-store";

export const SESSION_COOKIE = "describely_session";

interface SessionPayload {
  userId: string;
  exp: number;
}

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "describely-local-dev-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  };
  const encoded = encodeBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function parseSessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encoded)) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = parseSessionToken(token);
  return payload ? findUserById(payload.userId) : null;
}
