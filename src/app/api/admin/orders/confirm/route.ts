import { NextRequest, NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { confirmManualOrder } from "@/lib/billing-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const unauthorized = assertAdminRequest(req);
  if (unauthorized) return unauthorized;

  const { orderId, note } = await req.json();
  if (!orderId) return NextResponse.json({ error: "缺少订单号" }, { status: 400 });

  const result = await confirmManualOrder(String(orderId), note ? String(note) : undefined);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json(result);
}
