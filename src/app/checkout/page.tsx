import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";

const products: Record<string, { name: string; price: string; credits: string; desc: string }> = {
  starter: {
    name: "入门包",
    price: "¥25",
    credits: "约 50 额度",
    desc: "适合先小额体验 Claude 精写效果。",
  },
  standard: {
    name: "标准包",
    price: "¥45",
    credits: "约 100 额度",
    desc: "适合每周稳定上新，单次额度更划算。",
  },
  pro: {
    name: "进阶包",
    price: "¥68",
    credits: "约 160 额度",
    desc: "适合批量铺货或连续优化多个商品。",
  },
  "traffic-small": {
    name: "小流量包",
    price: "¥9",
    credits: "补充约 15 额度",
    desc: "已充值用户临时补充少量额度。",
  },
  "traffic-plus": {
    name: "加量包",
    price: "¥19",
    credits: "补充约 40 额度",
    desc: "已充值用户补充常用额度。",
  },
  "traffic-sprint": {
    name: "冲刺包",
    price: "¥39",
    credits: "补充约 90 额度",
    desc: "适合短期集中生成时加量。",
  },
};

interface CheckoutPageProps {
  searchParams: Promise<{
    id?: string;
    type?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const product = products[params.id || ""] || products.starter;
  const isTraffic = params.type === "traffic";

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">BULUBA</Link>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/pricing" className="text-sm font-semibold text-warm-500 hover:text-warm-900">返回价格</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-16 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-xl border border-warm-200 bg-white p-7 shadow-sm">
          <span className="text-xs font-semibold uppercase text-accent-dark">Checkout</span>
          <h1 className="mt-3 text-4xl font-bold text-warm-900">确认购买</h1>
          <p className="mt-4 text-base leading-relaxed text-warm-600">
            当前支付页先作为下单确认入口。正式上线时，这里会接入微信支付、支付宝或人工充值核销流程。
          </p>

          <div className="mt-8 rounded-xl border border-warm-200 bg-cream p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-warm-500">{isTraffic ? "流量包" : "额度套餐"}</p>
                <h2 className="mt-2 text-2xl font-bold text-warm-900">{product.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-warm-600">{product.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent-dark">{product.credits}</span>
            </div>
            <div className="mt-7 flex items-end gap-2">
              <span className="text-5xl font-bold text-warm-900">{product.price}</span>
              <span className="pb-2 text-sm text-warm-400">/ 次充值</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {["登录账号", "完成支付", "自动到账"].map((step, index) => (
              <div key={step} className="rounded-lg border border-warm-100 bg-white px-4 py-3">
                <span className="text-xs font-bold text-accent-dark">0{index + 1}</span>
                <p className="mt-2 text-sm font-bold text-warm-900">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm lg:self-start">
          <h2 className="text-lg font-bold text-amber-950">测试阶段说明</h2>
          <p className="mt-3 text-sm leading-relaxed text-amber-800">
            现在还没有接入真实支付通道，所以这个按钮暂时不会扣款。等支付接口确定后，会在这里完成付款、订单记录和额度到账。
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-amber-700 px-4 py-3 text-sm font-bold text-white opacity-60"
            >
              支付接口接入中
            </button>
            <Link
              href="/contact"
              className="inline-flex w-full justify-center rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-bold text-amber-900 hover:border-amber-600"
            >
              联系人工充值
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
