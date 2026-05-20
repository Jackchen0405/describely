import { NextRequest, NextResponse } from "next/server";
import { deleteVerificationCode, getVerificationCode, upsertEmailUser } from "@/lib/auth-store";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

type CodeStore = Map<string, { code: string; expiresAt: number }>;

const globalForCodes = globalThis as typeof globalThis & {
  describelyEmailCodes?: CodeStore;
};

function getStoredCode(email: string) {
  return globalForCodes.describelyEmailCodes?.get(email.trim().toLowerCase()) || null;
}

function deleteStoredCode(email: string) {
  globalForCodes.describelyEmailCodes?.delete(email.trim().toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    const submittedCode = String(code || "").trim();
    const stored = (await getVerificationCode(normalized)) || getStoredCode(normalized);

    if (!stored || stored.expiresAt < Date.now()) {
      return NextResponse.json({ error: "验证码已过期，请重新获取" }, { status: 400 });
    }

    if (stored.code !== submittedCode) {
      return NextResponse.json({ error: "验证码不正确" }, { status: 400 });
    }

    deleteStoredCode(normalized);
    await deleteVerificationCode(normalized);
    const user = await upsertEmailUser(normalized);
    const token = createSessionToken(user.id);
    const res = NextResponse.json({ user });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "登录失败";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "登录失败，请稍后再试" : message },
      { status: 500 }
    );
  }
}
