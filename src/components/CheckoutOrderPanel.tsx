"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PaymentOrder } from "@/types";
import { CheckoutProduct } from "@/lib/pricing";

interface Props {
  product: CheckoutProduct;
  isLoggedIn: boolean;
}

function qrPlaceholder(name: string) {
  return (
    <div className="flex aspect-square w-full max-w-[190px] items-center justify-center rounded-lg border border-dashed border-warm-300 bg-cream text-center text-sm font-bold text-warm-500">
      {name}
      <br />
      收款码
    </div>
  );
}

function qrImage(src: string, alt: string) {
  return (
    <div className="relative aspect-square w-full max-w-[190px] overflow-hidden rounded-lg border border-warm-200 bg-white">
      <Image src={src} alt={alt} fill sizes="190px" className="object-contain p-2" />
    </div>
  );
}

export default function CheckoutOrderPanel({ product, isLoggedIn }: Props) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [paidClicked, setPaidClicked] = useState(false);
  const [error, setError] = useState("");

  const remarkCode = useMemo(() => {
    if (!order) return "";
    return order.id.slice(-6).toUpperCase();
  }, [order]);

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

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-bold text-amber-950">先登录，再付款</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          额度会加到你的账号里，所以付款前需要先登录。新邮箱会自动创建账号。
        </p>
        <Link
          href={`/login?redirect=/checkout?type=${product.kind}&id=${product.id}`}
          className="mt-5 inline-flex w-full justify-center rounded-lg bg-amber-700 px-4 py-3 text-sm font-bold text-white"
        >
          登录后继续
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-warm-200 bg-white p-5">
      <h2 className="text-lg font-bold text-warm-900">付款</h2>
      <p className="mt-2 text-sm leading-relaxed text-warm-600">
        当前为早期测试版，先采用人工确认收款。你付款后，我们会在后台确认订单，额度会自动加到账号里。
      </p>

      {order ? (
        <div className="mt-5 space-y-5">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-orange-950">付款金额</p>
                <p className="mt-1 text-4xl font-black text-orange-700">¥{order.amountCny}</p>
                <p className="mt-1 text-sm text-orange-800">
                  {order.productName} · {order.credits} 额度
                </p>
              </div>
              <div className="rounded-lg bg-white px-4 py-3 text-center">
                <p className="text-xs font-bold text-warm-500">付款备注</p>
                <button
                  onClick={() => copy(remarkCode)}
                  className="mt-1 text-3xl font-black tracking-widest text-warm-950"
                >
                  {remarkCode}
                </button>
                <p className="mt-1 text-xs text-warm-500">点击复制，付款时填备注</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-warm-200 bg-white p-4">
              <p className="mb-3 text-sm font-bold text-warm-900">微信支付</p>
              {qrImage("/payment/微信收款码.png", "微信收款码")}
            </div>
            <div className="rounded-xl border border-warm-200 bg-white p-4">
              <p className="mb-3 text-sm font-bold text-warm-900">支付宝</p>
              {qrPlaceholder("支付宝")}
            </div>
          </div>

          <div className="rounded-xl border border-warm-200 bg-cream p-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-warm-500">订单号</span>
              <button
                onClick={() => copy(order.id)}
                className="break-all text-right font-mono text-xs font-bold text-warm-900"
              >
                {order.id}
              </button>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-warm-500">状态</span>
              <span className="font-bold text-amber-700">等待确认</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPaidClicked(true)}
            className="w-full rounded-lg bg-warm-900 px-4 py-3 text-sm font-bold text-white hover:bg-warm-700"
          >
            我已付款，等待确认
          </button>

          {paidClicked ? (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
              已记录你的付款意向。确认收款后额度会自动到账；如果长时间未到账，可以通过右下角在线客服发送订单号。
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={createOrder}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-warm-900 px-4 py-3 text-sm font-bold text-white hover:bg-warm-700 disabled:opacity-60"
        >
          {loading ? "正在生成订单..." : "生成付款订单"}
        </button>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
