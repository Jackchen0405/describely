import Link from "next/link";
import Image from "next/image";
import AuthStatus from "@/components/AuthStatus";
import SiteFooter from "@/components/SiteFooter";

const navItems = [
  { href: "#workflow", label: "使用流程" },
  { href: "#platforms", label: "平台模板" },
  { href: "#models", label: "模型能力" },
  { href: "/pricing", label: "价格" },
  { href: "/history", label: "历史" },
];

const modelBadges = [
  { key: "claude", name: "Claude", desc: "付费精写主模型，适合长文案、细腻表达和复杂商品资料理解" },
  { key: "chatgpt", name: "ChatGPT", desc: "用于复杂推理、多语言润色、本地化改写和结构校对" },
  { key: "gemini", name: "Gemini", desc: "用于多模态图片理解、长资料分析和商品信息补全" },
  { key: "deepseek", name: "DeepSeek", desc: "免费体验和基础整理模型，用来低成本跑通生成流程" },
];

const workflow = [
  {
    label: "01",
    title: "先把商品资料变清楚",
    desc: "上传图片，填写品类、目标国家、平台、成本和文案风格。AI 会先理解产品，而不是直接套模板。",
  },
  {
    label: "02",
    title: "追问真正影响转化的问题",
    desc: "围绕 FAB、使用场景、真实痛点、购买顾虑和竞品差异追问，把中文卖点翻译成买家价值。",
  },
  {
    label: "03",
    title: "按平台生成完整字段",
    desc: "Amazon、Shopify、TikTok Shop、WooCommerce 会得到不同结构、语气、关键词位置和内容长度。",
  },
  {
    label: "04",
    title: "保存历史，继续批量上品",
    desc: "生成结果自动进入历史记录，可以查看完整内容、复制字段、继续修改和复用。",
  },
];

const platformCards = [
  { key: "amazon", name: "Amazon", desc: "标题、五点、后台搜索词、A+ 内容、定价建议", accent: "bg-[#ff9900] text-[#101820]" },
  { key: "shopify", name: "Shopify", desc: "商品页短描述、品牌故事、SEO 标题、Meta Description", accent: "bg-[#95bf47] text-white" },
  { key: "tiktok", name: "TikTok Shop", desc: "短标题、视频钩子、直播卖点、搜索关键词", accent: "bg-[#101010] text-white" },
  { key: "woocommerce", name: "WooCommerce", desc: "独立站短描述、长描述、分类关键词、URL Slug", accent: "bg-[#7f54b3] text-white" },
];

const copywritingRules = [
  ["FAB", "把产品特性翻译成用户收益"],
  ["场景", "让买家脑中出现使用画面"],
  ["情绪", "找到真实痛点和记忆点"],
  ["活人", "像懂用户的人在说话"],
  ["身份", "让产品成为审美和品位符号"],
];

function ModelIcon({ type, size = 52 }: { type: string; size?: number }) {
  const srcMap: Record<string, string> = {
    claude: "/model-icons/claude.png",
    chatgpt: "/model-icons/chatgpt-w.png",
    gemini: "/model-icons/gemini.png",
    deepseek: "/model-icons/deepseek.png",
  };
  const altMap: Record<string, string> = {
    claude: "Claude logo",
    chatgpt: "ChatGPT logo",
    gemini: "Gemini logo",
    deepseek: "DeepSeek logo",
  };

  return (
    <Image
      src={srcMap[type]}
      alt={altMap[type] || "AI model logo"}
      width={size}
      height={size}
      className="h-full w-full object-contain"
      priority={false}
    />
  );
}

function PlatformMark({ type }: { type: string }) {
  const labels: Record<string, string> = {
    amazon: "a",
    shopify: "S",
    tiktok: "T",
    woocommerce: "W",
  };
  const item = platformCards.find((platform) => platform.key === type);
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-lg text-base font-black ${item?.accent || "bg-warm-100 text-warm-900"}`}>
      {labels[type] || "P"}
    </span>
  );
}

function HeroWorkspace() {
  return (
    <div className="relative">
      <div className="absolute -left-6 top-8 hidden h-24 w-24 border border-[#f05f3b] lg:block" />
      <div className="absolute -bottom-6 right-8 hidden h-20 w-20 border border-[#2fb8a0] lg:block" />
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#111714] shadow-2xl shadow-black/35">
        <div className="grid border-b border-white/10 md:grid-cols-[0.76fr_1.24fr]">
          <div className="border-b border-white/10 p-4 md:border-b-0 md:border-r">
            <span className="text-[11px] font-semibold uppercase text-[#f0c36d]">Seller Input</span>
            <div className="mt-4 space-y-3">
              {["美国 / Amazon", "运动瑜伽裤", "稳妥转化型"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-3 text-sm text-white">
                  {item}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                {["主图", "细节", "包装", "场景"].map((item) => (
                  <div key={item} className="grid aspect-square place-items-center rounded-lg bg-[#ead8c4] text-xs font-semibold text-[#39251a]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-[#9be3d4]">AI Listing Draft</span>
              <span className="rounded-full bg-[#9be3d4] px-2.5 py-1 text-[11px] font-bold text-[#10231f]">已保存</span>
            </div>
            <h3 className="max-w-md text-2xl font-black leading-tight text-white">
              Ribbed High-Waist Yoga Pants That Stay Put Through Deep Squats
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/62">
              从“高倍弹力面料”翻译成“深蹲不掉裆，下腰不走光”，让卖点变成买家能立刻理解的理由。
            </p>
            <div className="mt-5 grid gap-3">
              {["FAB 用户收益", "场景画面", "购买顾虑解除"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg bg-white/[0.07] px-4 py-3 text-sm text-white">
                  <span>{item}</span>
                  <span className="h-1.5 w-20 rounded-full bg-[#f05f3b]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
          {["标题", "五点", "SEO", "平台字段"].map((item) => (
            <div key={item} className="p-4">
              <span className="text-[11px] uppercase text-white/35">{item}</span>
              <div className="mt-3 h-2 rounded-full bg-white/10" />
              <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#24160f]">
      <header className="sticky top-0 z-20 border-b border-[#2b1a12]/10 bg-[#f7efe3]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="text-xl font-black tracking-tight">BULUBA</Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-[#6d5a4c] transition-colors hover:text-[#24160f]">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="rounded-lg bg-[#24160f] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#c7512f]">
              在线试用
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#1b211e] text-white">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
            <div>
              <div className="mb-6 flex w-fit items-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f0c36d]">
                Listing Copy Operating System
              </div>
              <h1 className="max-w-4xl text-6xl font-black leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-8xl">
                把商品参数写成买家想下单的理由
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
                BULUBA 为中国跨境卖家把图片、成本、卖点和目标市场，生成可直接上架的高转化文案。不是翻译字段，而是用 Claude 级别强模型和文案方法论重写 Listing。
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/tool" className="rounded-lg bg-[#f05f3b] px-6 py-3 text-sm font-black text-white shadow-xl shadow-[#f05f3b]/25 transition-colors hover:bg-[#d94c2e]">
                  开始生成文案
                </Link>
                <span className="rounded-lg border border-white/12 px-4 py-3 text-sm text-white/62">上传图片 → AI 追问 → 文案张力生成</span>
              </div>
            </div>
            <HeroWorkspace />
          </div>
        </section>

        <section className="border-y border-[#2b1a12]/10 bg-[#f7efe3]">
          <div className="mx-auto grid max-w-7xl divide-y divide-[#2b1a12]/10 px-5 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8">
            {[
              ["文案方法论", "FAB、场景、情绪、活人表达、身份感"],
              ["平台字段", "Amazon、Shopify、TikTok Shop、WooCommerce"],
              ["历史复用", "完整保存标题、五点、长描述、SEO 和定价"],
            ].map(([title, desc]) => (
              <div key={title} className="py-7 lg:px-7">
                <p className="text-sm font-black text-[#c7512f]">{title}</p>
                <p className="mt-2 text-base font-semibold text-[#493529]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="bg-[#f7efe3] py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[#c7512f]">Workflow</span>
                <h2 className="mt-4 text-5xl font-black leading-tight text-[#24160f]">从资料混乱，到可直接复制上架</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {workflow.map((step) => (
                  <article key={step.label} className="rounded-lg border border-[#2b1a12]/10 bg-white p-6 shadow-sm">
                    <span className="text-sm font-black text-[#2fb8a0]">{step.label}</span>
                    <h3 className="mt-5 text-2xl font-black text-[#24160f]">{step.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#6d5a4c]">{step.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e7d5c3] py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-8">
            <div>
              <span className="text-sm font-black uppercase tracking-[0.16em] text-[#7b3a27]">Copy Tension</span>
              <h2 className="mt-4 text-5xl font-black leading-tight text-[#24160f]">不是把字段填满，而是改变买家看待产品的角度</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#5c4536]">
                普通 AI 会写“高品质、适合日常”。BULUBA 要做的是把工厂参数、卖家经验和竞品痛点，转成有画面、有情绪、有购买理由的表达。
              </p>
            </div>
            <div className="grid gap-3">
              {copywritingRules.map(([title, desc]) => (
                <article key={title} className="grid grid-cols-[96px_1fr] items-center rounded-lg border border-[#2b1a12]/10 bg-[#fffaf2]">
                  <div className="border-r border-[#2b1a12]/10 p-5 text-2xl font-black text-[#c7512f]">{title}</div>
                  <p className="p-5 text-base font-semibold text-[#493529]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platforms" className="bg-[#f7efe3] py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[#c7512f]">Platform Templates</span>
                <h2 className="mt-4 text-5xl font-black leading-tight text-[#24160f]">不同平台，不该输出同一种文案</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-[#6d5a4c]">
                用户先选平台，AI 再决定字段结构、关键词位置、语气强度和转化重点。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {platformCards.map((item) => (
                <article key={item.key} className="rounded-lg border border-[#2b1a12]/10 bg-white p-5 shadow-sm">
                  <PlatformMark type={item.key} />
                  <h3 className="mt-5 text-2xl font-black text-[#24160f]">{item.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#6d5a4c]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="models" className="bg-[#121614] py-24 text-white">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[#9be3d4]">Model Stack</span>
                <h2 className="mt-4 text-5xl font-black leading-tight">免费先试 DeepSeek，付费主打 Claude 精写</h2>
                <p className="mt-5 text-base leading-8 text-white/62">
                  DeepSeek 用来让新用户低成本体验流程；付费生成会把长文案、情绪种草、平台字段精修交给 Claude 为主的强模型处理，ChatGPT 和 Gemini 负责补充推理、多语言和图片理解能力。
                </p>
                <div className="mt-6 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-white">免费体验</p>
                    <p className="mt-2 leading-6">用 DeepSeek 跑通商品资料、平台模板和基础文案结构。</p>
                  </div>
                  <div className="rounded-lg border border-[#f0c36d]/30 bg-[#f0c36d]/10 p-4">
                    <p className="font-black text-[#f0c36d]">付费精写</p>
                    <p className="mt-2 leading-6">用 Claude 主写更像真人、更有场景和购买理由的上架文案。</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {modelBadges.map((item) => (
                  <article key={item.key} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                    <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#0b0e0d] p-2">
                      <ModelIcon type={item.key} size={64} />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{item.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fffaf2] py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <span className="text-sm font-black uppercase tracking-[0.16em] text-[#c7512f]">Credits</span>
              <h2 className="mt-4 text-5xl font-black leading-tight text-[#24160f]">额度不是死次数，而是按模型和生成深度消耗</h2>
              <p className="mt-5 text-base leading-8 text-[#6d5a4c]">
                一个简单商品不应该和一套复杂资料收同样成本。BULUBA 会把模型、输入长度、输出长度和精写强度纳入扣减规则，让价格对用户容易理解，也让服务长期可持续。
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["基础生成", "1 额度起", "免费体验优先使用 DeepSeek，适合先看流程和字段结构。"],
                ["Claude 精写", "2 额度起", "适合正式上架、长描述、情绪种草和平台字段精修。"],
                ["深度生成", "3 额度起", "适合图片多、资料长、需要更强推理和多版本表达的商品。"],
              ].map(([title, amount, desc]) => (
                <article key={title} className="rounded-lg border border-[#2b1a12]/10 bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-[#c7512f]">{title}</p>
                  <p className="mt-4 text-3xl font-black text-[#24160f]">{amount}</p>
                  <p className="mt-4 text-sm leading-7 text-[#6d5a4c]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7efe3] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-[#2b1a12]/10 bg-[#121614] shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 text-white sm:p-10">
              <span className="text-sm font-black uppercase tracking-[0.16em] text-[#9be3d4]">Start Small</span>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">先免费试用，确认效果后再用 Claude 精写批量上新</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/66">
                不需要一开始就充值。先用 DeepSeek 体验从商品资料、AI 追问到平台字段的完整流程；如果结果方向对，再用付费额度生成更适合正式上架的 Claude 精写版本。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tool" className="rounded-lg bg-[#f05f3b] px-6 py-3 text-sm font-black text-white hover:bg-[#d94c2e]">开始免费试用</Link>
                <Link href="/pricing" className="rounded-lg border border-white/15 px-6 py-3 text-sm font-black text-white hover:border-[#f0c36d]">查看额度价格</Link>
              </div>
            </div>
            <div className="grid border-t border-white/10 bg-white/[0.04] lg:border-l lg:border-t-0">
              {[
                ["01", "免费体验流程", "先看平台模板、追问逻辑和基础文案结构是否适合你的商品。"],
                ["02", "付费精写上架", "正式商品用 Claude 精写标题、五点、长描述和 SEO 字段。"],
                ["03", "保存历史复用", "生成结果进入历史记录，后续同类商品可以继续参考和修改。"],
              ].map(([num, title, desc]) => (
                <div key={num} className="border-b border-white/10 p-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f0c36d] text-sm font-black text-[#24160f]">{num}</span>
                    <div>
                      <h3 className="text-lg font-black text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/58">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
