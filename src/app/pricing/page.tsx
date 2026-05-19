import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";

const plans = [
  {
    name: "免费试用",
    price: "¥0",
    desc: "适合先验证产品效果",
    points: ["基础生成额度", "平台模板", "生成历史", "标准模型"],
  },
  {
    name: "专业版占位",
    price: "待定",
    desc: "等模型成本核算后确定",
    points: ["更多生成额度", "图片分析", "高级模型模式", "导出和复制增强"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">buluba</Link>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="rounded-full bg-warm-900 px-4 py-2 text-sm font-semibold text-white">在线试用</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase text-accent-dark">Pricing</span>
          <h1 className="mt-3 text-4xl font-bold text-warm-900">价格先占位，等模型成本算清楚再定</h1>
          <p className="mt-4 text-base leading-relaxed text-warm-600">
            当前阶段重点是验证生成质量、登录、额度和历史记录。真实上线前，需要根据模型成本、图片分析成本、支付手续费和用户使用频率来确定套餐。
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-warm-900">{plan.name}</h2>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-bold text-warm-900">{plan.price}</span>
                {plan.price !== "待定" && <span className="pb-1 text-sm text-warm-400">/ 月</span>}
              </div>
              <p className="mt-3 text-sm text-warm-500">{plan.desc}</p>
              <div className="mt-6 space-y-3">
                {plan.points.map((point) => (
                  <p key={point} className="text-sm text-warm-700">✓ {point}</p>
                ))}
              </div>
            </article>
          ))}
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
