"use client";

import { useMemo, useState } from "react";
import { PaymentOrder, PaymentOrderStatus } from "@/types";

type AdminOrder = PaymentOrder & {
  user?: {
    id: string;
    email?: string;
    name: string;
    provider: "email" | "wechat";
    credits: number;
  };
};

const statusLabels: Record<PaymentOrderStatus | "all", string> = {
  all: "全部",
  pending: "待确认",
  paid: "已完成",
  cancelled: "已取消",
  expired: "已过期",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminOrdersPanel() {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("buluba_admin_token") || "";
  });
  const [status, setStatus] = useState<PaymentOrderStatus | "all">("pending");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const totalPending = useMemo(
    () => orders.filter((order) => order.status === "pending").reduce((sum, order) => sum + order.amountCny, 0),
    [orders]
  );

  async function loadOrders(nextStatus = status) {
    if (!token.trim()) {
      setMessage("先输入管理员 token。");
      return;
    }
    setLoading(true);
    setMessage("");
    window.localStorage.setItem("buluba_admin_token", token.trim());

    const res = await fetch(`/api/admin/orders?status=${nextStatus}&limit=100`, {
      headers: { Authorization: `Bearer ${token.trim()}` },
      cache: "no-store",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "读取订单失败。");
      return;
    }
    setOrders(data.orders || []);
    setMessage(`已加载 ${data.orders?.length || 0} 笔订单。`);
  }

  async function confirmOrder(orderId: string) {
    if (!window.confirm("确认已经收到这笔款，并给用户增加额度？")) return;

    setConfirmingId(orderId);
    setMessage("");
    const res = await fetch("/api/admin/orders/confirm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, note: "admin confirmed in dashboard" }),
    });
    const data = await res.json();
    setConfirmingId(null);

    if (!res.ok) {
      setMessage(data.error || "确认失败。");
      return;
    }
    setMessage(data.alreadyPaid ? "这笔订单此前已经确认过。" : "确认成功，额度已增加。");
    await loadOrders(status);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setMessage("已复制。");
  }

  return (
    <main className="min-h-screen bg-[#f7efe5] px-5 py-8 text-warm-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-warm-200 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-warm-950 px-3 py-1 text-xs font-semibold text-white">
              <span aria-hidden="true">#</span>
              BULUBA ADMIN
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">充值订单后台</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-warm-600">
              上线早期的人工收款工作台：用户下单后进入待确认，你确认收到款项后点击按钮，系统会自动把额度加到用户账户。
            </p>
          </div>
          <a
            href="/pricing"
            className="rounded-full border border-warm-300 px-4 py-2 text-sm font-semibold text-warm-700 transition hover:bg-white"
          >
            查看价格页
          </a>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <label className="text-xs font-bold uppercase text-warm-500">管理员 Token</label>
            <div className="mt-2 flex gap-2">
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="粘贴 ADMIN_RECHARGE_TOKEN"
                type="password"
                className="min-w-0 flex-1 rounded-md border border-warm-200 px-3 py-2 text-sm outline-none focus:border-warm-700"
              />
              <button
                onClick={() => loadOrders()}
                className="inline-flex items-center gap-2 rounded-md bg-warm-950 px-4 py-2 text-sm font-semibold text-white"
              >
                <span aria-hidden="true">{loading ? "..." : "↻"}</span>
                加载
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-warm-500">当前列表</div>
            <div className="mt-2 text-3xl font-black">{orders.length}</div>
            <div className="text-sm text-warm-500">{statusLabels[status]}订单</div>
          </div>

          <div className="rounded-lg border border-warm-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-warm-500">待确认金额</div>
            <div className="mt-2 text-3xl font-black">¥{totalPending}</div>
            <div className="text-sm text-warm-500">仅统计当前筛选结果</div>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(Object.keys(statusLabels) as Array<PaymentOrderStatus | "all">).map((item) => (
            <button
              key={item}
              onClick={() => {
                setStatus(item);
                loadOrders(item);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                status === item ? "bg-warm-950 text-white" : "border border-warm-200 bg-white text-warm-600"
              }`}
            >
              {statusLabels[item]}
            </button>
          ))}
          {message ? <span className="text-sm text-warm-500">{message}</span> : null}
        </div>

        <div className="overflow-x-auto rounded-lg border border-warm-200 bg-white shadow-sm">
          <div className="min-w-[1040px]">
            <div className="grid grid-cols-12 gap-3 border-b border-warm-100 bg-warm-50 px-4 py-3 text-xs font-bold uppercase text-warm-500">
              <div className="col-span-3">订单</div>
              <div className="col-span-2">用户</div>
              <div className="col-span-2">套餐</div>
              <div className="col-span-1 text-right">金额</div>
              <div className="col-span-1 text-right">额度</div>
              <div className="col-span-1">状态</div>
              <div className="col-span-1">时间</div>
              <div className="col-span-1 text-right">操作</div>
            </div>

            {orders.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-warm-500">暂无订单。输入 token 后点击加载。</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 gap-3 border-b border-warm-100 px-4 py-4 text-sm last:border-0"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="truncate">{order.id}</span>
                      <button onClick={() => copy(order.id)} className="text-warm-400 hover:text-warm-900">
                        复制
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-warm-400">{order.paymentMethod}</div>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <div className="truncate font-semibold">{order.user?.name || order.userId}</div>
                    <div className="truncate text-xs text-warm-400">
                      {order.user?.email || order.user?.provider || "-"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-semibold">{order.productName}</div>
                    <div className="text-xs text-warm-400">{order.productKind === "plan" ? "套餐" : "流量包"}</div>
                  </div>
                  <div className="col-span-1 text-right font-bold">¥{order.amountCny}</div>
                  <div className="col-span-1 text-right font-bold">{order.credits}</div>
                  <div className="col-span-1">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        order.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-warm-100 text-warm-500"
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs text-warm-500">
                    <div>{formatDate(order.createdAt)}</div>
                    {order.paidAt ? <div>付 {formatDate(order.paidAt)}</div> : null}
                  </div>
                  <div className="col-span-1 text-right">
                    {order.status === "pending" ? (
                      <button
                        onClick={() => confirmOrder(order.id)}
                        disabled={confirmingId === order.id}
                      className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                        <span aria-hidden="true">{confirmingId === order.id ? "..." : "✓"}</span>
                        确认
                      </button>
                    ) : (
                      <span className="text-xs text-warm-400">-</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
