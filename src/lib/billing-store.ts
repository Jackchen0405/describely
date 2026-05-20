import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PaymentOrder, PaymentOrderStatus } from "@/types";
import { addUserCredits } from "@/lib/auth-store";
import { getCheckoutProduct } from "@/lib/pricing";
import { hasSupabaseConfig, insertRow, patchRows, selectOne, selectRows } from "@/lib/supabase-rest";

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

interface StoredOrders {
  orders: PaymentOrder[];
}

interface SupabaseOrderRow {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_kind: "plan" | "traffic";
  amount_cny: number;
  credits: number;
  status: PaymentOrderStatus;
  payment_method: "manual" | "wechat" | "alipay";
  paid_at?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseUserLiteRow {
  id: string;
  email?: string | null;
  name: string;
  provider: "email" | "wechat";
  credits: number;
}

export interface AdminPaymentOrder extends PaymentOrder {
  user?: {
    id: string;
    email?: string;
    name: string;
    provider: "email" | "wechat";
    credits: number;
  };
}

function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readOrders(): PaymentOrder[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredOrders | PaymentOrder[];
    return Array.isArray(parsed) ? parsed : parsed.orders || [];
  } catch {
    return [];
  }
}

function writeOrders(orders: PaymentOrder[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders }, null, 2), "utf-8");
}

function fromSupabaseOrder(row: SupabaseOrderRow): PaymentOrder {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.product_name,
    productKind: row.product_kind,
    amountCny: row.amount_cny,
    credits: row.credits,
    status: row.status,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at || undefined,
    note: row.note || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSupabaseOrder(order: PaymentOrder) {
  return {
    id: order.id,
    user_id: order.userId,
    product_id: order.productId,
    product_name: order.productName,
    product_kind: order.productKind,
    amount_cny: order.amountCny,
    credits: order.credits,
    status: order.status,
    payment_method: order.paymentMethod,
    paid_at: order.paidAt || null,
    note: order.note || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

export async function createPaymentOrder(userId: string, productId: string, kind?: string | null) {
  const product = getCheckoutProduct(productId, kind);
  const now = new Date().toISOString();
  const order: PaymentOrder = {
    id: `ord_${crypto.randomUUID()}`,
    userId,
    productId: product.id,
    productName: product.name,
    productKind: product.kind,
    amountCny: product.priceCny,
    credits: product.credits,
    status: "pending",
    paymentMethod: "manual",
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabaseConfig()) {
    const row = await insertRow<SupabaseOrderRow>("payment_orders", toSupabaseOrder(order));
    return row ? fromSupabaseOrder(row) : order;
  }

  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders.slice(0, 1000));
  return order;
}

export async function getOrderForUser(userId: string, orderId: string) {
  if (hasSupabaseConfig()) {
    const row = await selectOne<SupabaseOrderRow>(
      "payment_orders",
      `user_id=eq.${encodeURIComponent(userId)}&id=eq.${encodeURIComponent(orderId)}`
    );
    return row ? fromSupabaseOrder(row) : null;
  }
  return readOrders().find((order) => order.userId === userId && order.id === orderId) || null;
}

export async function getRecentOrdersForUser(userId: string) {
  if (hasSupabaseConfig()) {
    const rows = await selectRows<SupabaseOrderRow>(
      "payment_orders",
      `user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=20`
    );
    return rows.map(fromSupabaseOrder);
  }
  return readOrders().filter((order) => order.userId === userId).slice(0, 20);
}

export async function getAdminOrders(
  status?: PaymentOrderStatus | "all",
  limit = 100
): Promise<AdminPaymentOrder[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  if (hasSupabaseConfig()) {
    const statusQuery = status && status !== "all" ? `status=eq.${encodeURIComponent(status)}&` : "";
    const rows = await selectRows<SupabaseOrderRow>(
      "payment_orders",
      `${statusQuery}order=created_at.desc&limit=${safeLimit}`
    );
    const orders = rows.map(fromSupabaseOrder);
    const userIds = Array.from(new Set(orders.map((order) => order.userId))).filter(Boolean);

    if (userIds.length === 0) return orders;

    const userRows = await selectRows<SupabaseUserLiteRow>(
      "app_users",
      `id=in.(${userIds.map(encodeURIComponent).join(",")})&select=id,email,name,provider,credits`
    );
    const users = new Map(
      userRows.map((user) => [
        user.id,
        {
          id: user.id,
          email: user.email || undefined,
          name: user.name,
          provider: user.provider,
          credits: user.credits,
        },
      ])
    );

    return orders.map((order) => ({ ...order, user: users.get(order.userId) }));
  }

  return readOrders()
    .filter((order) => !status || status === "all" || order.status === status)
    .slice(0, safeLimit);
}

export async function confirmManualOrder(orderId: string, note?: string) {
  const now = new Date().toISOString();

  if (hasSupabaseConfig()) {
    const row = await selectOne<SupabaseOrderRow>("payment_orders", `id=eq.${encodeURIComponent(orderId)}`);
    if (!row) return { ok: false as const, error: "订单不存在" };
    const order = fromSupabaseOrder(row);
    if (order.status === "paid") return { ok: true as const, order, alreadyPaid: true };
    if (order.status !== "pending") return { ok: false as const, error: "订单状态不能确认" };

    const updatedRows = await patchRows<SupabaseOrderRow>(
      "payment_orders",
      `id=eq.${encodeURIComponent(order.id)}`,
      {
        status: "paid",
        paid_at: now,
        note: note || "manual confirmed",
        updated_at: now,
      }
    );
    const updated = updatedRows[0] ? fromSupabaseOrder(updatedRows[0]) : { ...order, status: "paid" as const, paidAt: now, updatedAt: now };
    const user = await addUserCredits(updated.userId, updated.credits, "manual_recharge", updated.id);
    if (!user) return { ok: false as const, error: "用户不存在" };
    return { ok: true as const, order: updated, user };
  }

  const orders = readOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return { ok: false as const, error: "订单不存在" };
  if (order.status === "paid") return { ok: true as const, order, alreadyPaid: true };
  if (order.status !== "pending") return { ok: false as const, error: "订单状态不能确认" };
  order.status = "paid";
  order.paidAt = now;
  order.note = note || "manual confirmed";
  order.updatedAt = now;
  writeOrders(orders);
  const user = await addUserCredits(order.userId, order.credits, "manual_recharge", order.id);
  if (!user) return { ok: false as const, error: "用户不存在" };
  return { ok: true as const, order, user };
}
