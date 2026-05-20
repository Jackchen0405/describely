"use client";

import { useState } from "react";
import Link from "next/link";
import { PaymentOrder } from "@/types";
import { CheckoutProduct } from "@/lib/pricing";

interface Props {
  product: CheckoutProduct;
  isLoggedIn: boolean;
}

export default function CheckoutOrderPanel({ product, isLoggedIn }: Props) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, kind: product.kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建订单失败");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建订单失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-bold text-amber-950">登录后下单</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          订单需要绑定到你的账号，付款后额度才可以准确到账。
        </p>
        <Link
          href={`/login?redirect=/checkout?type=${product.kind}&id=${product.id}`}
          className="mt-5 inline-flex w-full justify-center rounded-lg bg-amber-700 px-4 py-3 text-sm font-bold text-white"
        >
          登录后继续购买
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-warm-200 bg-white p-5">
      <h2 className="text-lg font-bold text-warm-900">下单确认</h2>
      <p className="mt-2 text-sm leading-relaxed text-warm-600">
        当前阶段先生成订单号，人工确认付款后额度会加到你的账号里。正式支付通道接入后，这里会自动完成到账。
      </p>

      {order ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-950">订单已创建</p>
          <dl className="mt-3 space-y-2 text-sm text-emerald-800">
            <div className="flex justify-between gap-4">
              <dt>订单号</dt>
              <dd className="break-all font-mono text-xs">{order.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>金额</dt>
              <dd>¥{order.amountCny}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>额度</dt>
              <dd>{order.credits}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>状态</dt>
              <dd>等待人工确认</dd>
            </div>
          </dl>
          <Link
            href="/contact"
            className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white"
          >
            联系客服确认付款
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={createOrder}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-warm-900 px-4 py-3 text-sm font-bold text-white hover:bg-warm-700 disabled:opacity-60"
        >
          {loading ? "正在创建订单..." : "创建订单"}
        </button>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
