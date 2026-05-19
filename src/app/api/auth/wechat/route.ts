import { NextResponse } from "next/server";
import { upsertWechatDemoUser } from "@/lib/auth-store";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = upsertWechatDemoUser();
  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    user,
    mode: "demo",
    message: "当前是微信扫码登录占位。接入微信开放平台后替换为 OAuth 回调。",
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
