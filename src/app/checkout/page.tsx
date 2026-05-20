import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import CheckoutOrderPanel from "@/components/CheckoutOrderPanel";
import { currentUser } from "@/lib/session";
import { formatCredits, formatPrice, getCheckoutProduct } from "@/lib/pricing";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{
    id?: string;
    type?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const user = await currentUser();
  const product = getCheckoutProduct(params.id, params.type);
  const isTraffic = product.kind === "traffic";

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
          <h1 className="mt-3 text-4xl font-bold text-warm-900">确认充值</h1>
          <p className="mt-4 text-base leading-relaxed text-warm-600">
            先生成订单，再扫码付款。付款时备注订单后 6 位，我们确认收款后，额度会自动加到你的账号里。
          </p>

          <div className="mt-8 rounded-xl border border-warm-200 bg-cream p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-warm-500">{isTraffic ? "流量包" : "额度套餐"}</p>
                <h2 className="mt-2 text-2xl font-bold text-warm-900">{product.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-warm-600">{product.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent-dark">
                {formatCredits(product.credits, product.kind)}
              </span>
            </div>
            <div className="mt-7 flex items-end gap-2">
              <span className="text-5xl font-bold text-warm-900">{formatPrice(product.priceCny)}</span>
              <span className="pb-2 text-sm text-warm-400">/ 次充值</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {["登录账号", "生成订单", "扫码付款"].map((step, index) => (
              <div key={step} className="rounded-lg border border-warm-100 bg-white px-4 py-3">
                <span className="text-xs font-bold text-accent-dark">0{index + 1}</span>
                <p className="mt-2 text-sm font-bold text-warm-900">{step}</p>
              </div>
            ))}
          </div>

          <CheckoutOrderPanel product={product} isLoggedIn={Boolean(user)} />
        </section>

        <aside className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm lg:self-start">
          <h2 className="text-lg font-bold text-amber-950">到账说明</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-amber-800">
            <p className="rounded-lg bg-white px-4 py-3">付款备注请填写订单后 6 位，方便我们快速匹配订单。</p>
            <p className="rounded-lg bg-white px-4 py-3">早期测试阶段为人工确认，通常会尽快处理；不在线时可能会稍有延迟。</p>
            <p className="rounded-lg bg-white px-4 py-3">确认后额度会自动到账，历史订单也会保留在系统里。</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
