import { NextRequest, NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { getAdminOrders } from "@/lib/billing-store";
import { PaymentOrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["all", "pending", "paid", "cancelled", "expired"]);

export async function GET(req: NextRequest) {
  const unauthorized = assertAdminRequest(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const rawStatus = searchParams.get("status") || "all";
  const status = STATUSES.has(rawStatus) ? rawStatus : "all";
  const limit = Number(searchParams.get("limit") || 100);

  const orders = await getAdminOrders(
    status as PaymentOrderStatus | "all",
    Number.isFinite(limit) ? limit : 100
  );
  return NextResponse.json({ orders });
}
