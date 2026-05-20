import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "隐私政策" },
  { href: "/terms", label: "服务条款" },
  { href: "/refund", label: "退款与额度说明" },
  { href: "/contact", label: "联系我们" },
  { href: "/feedback", label: "提建议" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#2b1a12]/10 bg-[#f7efe3] py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Link href="/" className="text-xl font-black tracking-tight text-[#24160f]">BULUBA</Link>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#6d5a4c]">
            BULUBA 是面向中国跨境卖家的 AI 商品文案助手，把商品参数、图片、成本和目标市场，整理成有场景、有卖点、有转化张力的上架文案。
          </p>
          <p className="mt-3 text-xs leading-6 text-[#8a7666]">
            AI 生成内容仅作为文案辅助和运营参考，正式发布前请结合平台规则、商品实际情况和当地法规自行审核。
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#6d5a4c] lg:justify-end">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#24160f]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-[#2b1a12]/10 px-5 pt-6 text-xs text-[#8a7666] sm:flex-row lg:px-8">
        <span>© {new Date().getFullYear()} BULUBA. All rights reserved.</span>
        <span>域名：www.buluba.in · 测试版服务</span>
      </div>
    </footer>
  );
}
