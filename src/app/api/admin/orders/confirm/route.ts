import { NextRequest, NextResponse } from "next/server";
import { confirmManualOrder } from "@/lib/billing-store";

export const dynamic = "force-dynamic";

function getAdminToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-admin-token") || "";
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_RECHARGE_TOKEN || "";
  if (!expected) {
    return NextResponse.json({ error: "未配置 ADMIN_RECHARGE_TOKEN" }, { status: 500 });
  }

  const token = getAdminToken(req);
  if (!token || token !== expected) {
    return NextResponse.json({ error: "无权限确认订单" }, { status: 401 });
  }

  const { orderId, note } = await req.json();
  if (!orderId) return NextResponse.json({ error: "缺少订单号" }, { status: 400 });

  const result = await confirmManualOrder(String(orderId), note ? String(note) : undefined);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json(result);
}
