import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createPaymentOrder, getRecentOrdersForUser } from "@/lib/billing-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const orders = await getRecentOrdersForUser(user.id);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录后再下单" }, { status: 401 });

  const { productId, kind } = await req.json();
  const order = await createPaymentOrder(user.id, String(productId || ""), kind ? String(kind) : null);
  return NextResponse.json({ order });
}
