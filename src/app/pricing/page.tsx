import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import {
  checkoutProducts,
  costNotes,
  creditRules,
  formatCredits,
  formatPrice,
  freePlan,
  paidBenefits,
} from "@/lib/pricing";

const paidPlans = checkoutProducts.filter((product) => product.kind === "plan");
const trafficPacks = checkoutProducts.filter((product) => product.kind === "traffic");

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">BULUBA</Link>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="rounded-full bg-warm-900 px-4 py-2 text-sm font-semibold text-white">在线试用</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase text-accent-dark">Pricing</span>
          <h1 className="mt-3 text-4xl font-bold text-warm-900">先用低门槛价格试出效果，再按额度持续生成</h1>
          <p className="mt-4 text-base leading-relaxed text-warm-600">
            免费体验用 DeepSeek 跑通流程；充值后使用 Claude、Gemini、ChatGPT 这类强模型。付费套餐权益一致，只是额度不同。
          </p>
        </div>

        <article className="mt-10 rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-warm-900">{freePlan.name}</h2>
                <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-semibold text-warm-700">{freePlan.badge}</span>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-bold text-warm-900">{freePlan.price}</span>
              </div>
              <p className="mt-3 text-sm text-warm-500">{freePlan.desc}</p>
            </div>
            <div className="grid gap-3 md:w-[52%] md:grid-cols-2">
              {freePlan.points.map((point) => (
                <p key={point} className="rounded-lg bg-cream px-4 py-3 text-sm text-warm-700">✓ {point}</p>
              ))}
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {paidPlans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-xl border p-6 shadow-sm ${
                plan.highlight ? "border-accent bg-white shadow-lg shadow-accent/10" : "border-warm-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-warm-900">{plan.name}</h2>
                <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-semibold text-warm-700">{formatCredits(plan.credits, plan.kind)}</span>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-bold text-warm-900">{formatPrice(plan.priceCny)}</span>
                <span className="pb-1 text-sm text-warm-400">/ 次充值</span>
              </div>
              <p className="mt-3 text-sm text-warm-500">{plan.desc}</p>
              <div className="mt-6 space-y-3">
                {paidBenefits.map((point) => (
                  <p key={point} className="text-sm text-warm-700">✓ {point}</p>
                ))}
              </div>
              <Link
                href={`/checkout?type=plan&id=${plan.id}`}
                className={`mt-6 inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold ${
                  plan.highlight ? "bg-accent text-white hover:bg-accent-dark" : "bg-warm-900 text-white hover:bg-warm-700"
                }`}
              >
                选择这个套餐
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-warm-900">流量包</h2>
              <p className="mt-2 text-sm leading-relaxed text-warm-600">
                已充值用户额度临时不够时，可以单独补充流量包。流量包只增加额度，不改变模型权益。
              </p>
            </div>
            <span className="text-xs font-semibold uppercase text-accent-dark">Add-on Credits</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {trafficPacks.map((product) => (
              <div key={product.id} className="rounded-lg border border-warm-100 bg-cream p-4">
                <p className="text-sm font-bold text-warm-900">{product.name}</p>
                <p className="mt-3 text-3xl font-bold text-warm-900">{formatPrice(product.priceCny)}</p>
                <p className="mt-2 text-sm text-warm-500">{formatCredits(product.credits, product.kind)}</p>
                <Link
                  href={`/checkout?type=traffic&id=${product.id}`}
                  className="mt-4 inline-flex w-full justify-center rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-sm font-bold text-warm-800 hover:border-accent"
                >
                  购买流量包
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-warm-900">成本口径</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {costNotes.map((note) => (
              <p key={note} className="rounded-lg bg-cream px-4 py-3 text-sm leading-relaxed text-warm-600">{note}</p>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-warm-200 bg-white p-6 shadow-sm md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold text-warm-900">额度怎么扣</h2>
            <p className="mt-3 text-sm leading-relaxed text-warm-600">
              扣减规则会按真实模型成本计算，不凭感觉定价。简单商品少扣，Claude 长文案和深度生成多扣，用户在生成前能看到大致消耗。
            </p>
          </div>
          <div className="grid gap-3">
            {creditRules.map(([name, amount, desc]) => (
              <div key={name} className="rounded-lg border border-warm-100 bg-cream px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-warm-900">{name}</span>
                  <span className="text-sm font-bold text-accent-dark">{amount}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-warm-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-warm-200 bg-white p-5">
          <h2 className="text-base font-bold text-warm-900">为什么不直接包月无限用</h2>
          <p className="mt-2 text-sm leading-relaxed text-warm-600">
            强模型按 token 和图片理解收费，真正无限用容易被少数高频用户把成本打穿。第一版用额度包更稳：用户花 ¥25 就能试，平台也能保证 Claude 精写不会变成亏本服务。
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-bold text-amber-900">关于团队合用</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            第一版不做团队协作。小团队临时共用一个账号技术上可以做到，但会混在同一份历史记录和额度里，也不方便权限管理。等个人版跑通后，再决定是否值得做团队空间。
          </p>
        </div>
      </main>
    </div>
  );
}
