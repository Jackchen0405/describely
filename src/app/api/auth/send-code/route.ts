import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CodeStore = Map<string, { code: string; expiresAt: number }>;

const globalForCodes = globalThis as typeof globalThis & {
  describelyEmailCodes?: CodeStore;
};

const codeStore = globalForCodes.describelyEmailCodes ?? new Map<string, { code: string; expiresAt: number }>();
globalForCodes.describelyEmailCodes = codeStore;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalized = String(email || "").trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
  }

  const code = makeCode();
  codeStore.set(normalized, {
    code,
    expiresAt: Date.now() + 1000 * 60 * 10,
  });

  // Prototype note: production should send this code via an email provider.
  return NextResponse.json({
    success: true,
    message: "验证码已生成。上线后这里会接入邮件服务。",
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
