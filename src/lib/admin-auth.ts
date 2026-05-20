import { NextRequest, NextResponse } from "next/server";

export function getAdminToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-admin-token") || "";
}

export function assertAdminRequest(req: NextRequest) {
  const expected = (process.env.ADMIN_RECHARGE_TOKEN || "").trim();
  if (!expected) {
    return NextResponse.json({ error: "未配置 ADMIN_RECHARGE_TOKEN" }, { status: 500 });
  }

  const token = getAdminToken(req).trim();
  if (!token || token !== expected) {
    return NextResponse.json({ error: "无权限访问后台订单" }, { status: 401 });
  }

  return null;
}
