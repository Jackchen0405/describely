import Link from "next/link";
import Image from "next/image";
import AuthStatus from "@/components/AuthStatus";

const navItems = [
  { href: "#workflow", label: "使用流程" },
  { href: "#platforms", label: "平台模板" },
  { href: "#models", label: "模型能力" },
  { href: "/pricing", label: "价格" },
  { href: "/history", label: "历史" },
];

const workflow = [
  {
    title: "上传图片和基础信息",
    desc: "填写产品名、品类、目标国家、上架平台、拿货价和物流成本；最多上传 4 张产品图。",
    detail: "图片会辅助 AI 识别材质、形态、细节和使用场景。",
    visual: "upload",
  },
  {
    title: "AI 追问关键卖点",
    desc: "根据品类、图片、目标市场和平台模板生成 4-5 个追问。",
    detail: "服装问面料和尺码，3C 问规格和兼容性，礼品问场景和包装。",
    visual: "questions",
  },
  {
    title: "选择平台字段模板",
    desc: "Amazon、Shopify、TikTok Shop、WooCommerce 会输出不同字段。",
    detail: "平台会影响语气、字段结构、关键词位置、转化重点和定价建议。",
    visual: "platform",
  },
  {
    title: "生成全套 Listing",
    desc: "一次生成标题、短描述、五点、长描述、A+、SEO、后台词、平台字段和定价建议。",
    detail: "结果会保存到历史记录，方便后续复制、修改和复用。",
    visual: "result",
  },
];

const platformCards = [
  { key: "amazon", name: "Amazon", fields: "标题、五点、后台搜索词、A+ 内容、定价建议", color: "bg-amber-50 border-amber-200" },
  { key: "shopify", name: "Shopify", fields: "商品页短描述、品牌故事、SEO 标题、Meta Description", color: "bg-emerald-50 border-emerald-200" },
  { key: "tiktok", name: "TikTok Shop", fields: "短标题、视频钩子、直播卖点、搜索关键词", color: "bg-rose-50 border-rose-200" },
  { key: "woocommerce", name: "WooCommerce", fields: "独立站短描述、长描述、分类关键词、URL Slug", color: "bg-sky-50 border-sky-200" },
];

const modelBadges = [
  { key: "claude", name: "Claude", desc: "长上下文、细腻表达、商品资料理解" },
  { key: "chatgpt", name: "ChatGPT", desc: "复杂推理、多语言、本地化重写" },
  { key: "gemini", name: "Gemini", desc: "多模态、图片理解、长资料分析" },
  { key: "deepseek", name: "DeepSeek", desc: "高性价比文案生成和日常批量任务" },
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

function PlatformIcon({ type }: { type: string }) {
  const base = "grid h-12 w-12 place-items-center rounded-xl text-base font-black shadow-sm";
  const styles: Record<string, string> = {
    amazon: "bg-[#ff9900] text-[#101820]",
    shopify: "bg-[#95bf47] text-white",
    tiktok: "bg-[#101010] text-white",
    woocommerce: "bg-[#7f54b3] text-white",
  };
  const labels: Record<string, string> = {
    amazon: "a",
    shopify: "S",
    tiktok: "♪",
    woocommerce: "W",
  };
  return <span className={`${base} ${styles[type] || "bg-warm-100 text-warm-800"}`}>{labels[type] || "P"}</span>;
}

function WorkspacePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-2xl shadow-warm-900/10">
      <div className="flex items-center justify-between border-b border-warm-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <span className="text-xs font-medium text-warm-400">Describely / Listing Workspace</span>
      </div>
      <div className="grid md:grid-cols-[0.86fr_1.14fr]">
        <div className="border-b border-warm-100 bg-warm-50 p-5 md:border-b-0 md:border-r">
          <span className="text-xs font-semibold uppercase text-warm-500">卖家输入</span>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-warm-200 bg-white p-3">
              <span className="text-xs text-warm-400">目标市场</span>
              <p className="mt-1 text-sm font-medium text-warm-900">美国 / USD</p>
            </div>
            <div className="rounded-lg border border-warm-200 bg-white p-3">
              <span className="text-xs text-warm-400">上架平台</span>
              <p className="mt-1 text-sm font-medium text-warm-900">Amazon</p>
            </div>
            <div className="col-span-2 rounded-lg border border-dashed border-warm-300 bg-white p-3">
              <span className="text-xs text-warm-400">产品图片</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {["主图", "细节", "包装", "场景"].map((item) => (
                  <div key={item} className="grid aspect-square place-items-center rounded-md bg-warm-100 text-xs text-warm-500">{item}</div>
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-lg border border-warm-200 bg-white p-3">
              <span className="text-xs text-warm-400">产品信息</span>
              <p className="mt-1 text-sm text-warm-700">手工石制茶宠摆件，适合茶台装饰和东方礼品场景。</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-warm-500">AI 输出</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">保存到历史</span>
          </div>
          <div className="space-y-4">
            <section>
              <span className="text-xs text-warm-400">Product Title</span>
              <p className="mt-1 text-base font-semibold leading-snug text-warm-900">Handcrafted Stone Tea Pet Figurine for Gongfu Tea Table Decor</p>
            </section>
            <section>
              <span className="text-xs text-warm-400">Five Bullet Points</span>
              <div className="mt-2 space-y-2">
                {["Adds an Eastern accent to your tea ritual", "Solid stone texture with a handmade collectible feel", "Gift-ready decor for tea lovers and meditation spaces"].map((item) => (
                  <p key={item} className="rounded-lg bg-warm-50 px-3 py-2 text-sm text-warm-700">{item}</p>
                ))}
              </div>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-warm-100 p-3">
                <span className="text-xs text-warm-400">SEO</span>
                <p className="mt-1 text-sm text-warm-700">stone tea pet, gongfu tea decor</p>
              </div>
              <div className="rounded-lg border border-warm-100 p-3">
                <span className="text-xs text-warm-400">Price</span>
                <p className="mt-1 text-sm text-warm-700">$24.99 · premium gift range</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowVisual({ type }: { type: string }) {
  if (type === "upload") {
    return (
      <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xl shadow-warm-900/5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-warm-500">Product Intake</span>
          <span className="rounded-full bg-warm-100 px-3 py-1 text-xs text-warm-500">4 images</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {["主图", "细节", "包装", "场景"].map((item) => (
            <div key={item} className="grid aspect-square place-items-center rounded-xl border border-dashed border-warm-300 bg-warm-50 text-xs text-warm-500">{item}</div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-warm-50 p-4">
            <span className="text-xs text-warm-400">目标市场</span>
            <p className="mt-1 font-semibold text-warm-900">美国 / USD</p>
          </div>
          <div className="rounded-xl bg-warm-50 p-4">
            <span className="text-xs text-warm-400">平台</span>
            <p className="mt-1 font-semibold text-warm-900">Amazon</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "questions") {
    return (
      <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xl shadow-warm-900/5">
        <span className="text-xs font-semibold uppercase text-warm-500">AI Follow-up</span>
        <div className="mt-4 space-y-3">
          {["这款产品的核心材质和重量是多少？", "主要使用场景是送礼、茶台装饰还是收藏？", "包装里包含哪些配件？"].map((item, index) => (
            <div key={item} className="flex gap-3 rounded-xl bg-warm-50 p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">{index + 1}</span>
              <p className="text-sm text-warm-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "platform") {
    return (
      <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xl shadow-warm-900/5">
        <span className="text-xs font-semibold uppercase text-warm-500">Platform Routing</span>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {platformCards.map((item) => (
            <div key={item.key} className={`rounded-xl border p-4 ${item.color}`}>
              <PlatformIcon type={item.key} />
              <p className="mt-3 text-sm font-bold text-warm-900">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xl shadow-warm-900/5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-warm-500">Generated Listing</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">扣 1 次额度</span>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl bg-warm-50 p-4">
          <span className="text-xs text-warm-400">标题</span>
          <p className="mt-1 text-sm font-semibold text-warm-900">Handcrafted Stone Tea Pet Figurine for Gongfu Tea Table Decor</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-warm-50 p-4">
            <span className="text-xs text-warm-400">SEO</span>
            <p className="mt-1 text-sm text-warm-700">stone tea pet, gongfu decor</p>
          </div>
          <div className="rounded-xl bg-warm-50 p-4">
            <span className="text-xs text-warm-400">历史</span>
            <p className="mt-1 text-sm text-warm-700">自动保存</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-warm-900">Describely</Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-warm-500 transition-colors hover:text-warm-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="rounded-full bg-warm-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark">在线试用</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl content-center gap-10 px-6 py-12 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="flex flex-col justify-center">
            <span className="mb-5 w-fit rounded-full border border-warm-200 bg-white px-4 py-1.5 text-xs font-medium text-warm-500">
              从中文商品资料到可上架 Listing
            </span>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-warm-900 sm:text-6xl">
              跨境商品 AI 文案助手
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-warm-600">
              为中国跨境卖家把产品图片、成本、卖点和目标市场整理成可直接填写的电商文案。不是简单翻译，而是按平台和国家重写 Listing。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/tool" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent-dark">开始生成文案</Link>
              <span className="text-sm text-warm-400">上传图片 → AI 追问 → 生成 Listing</span>
            </div>
          </div>
          <div className="flex items-center">
            <WorkspacePreview />
          </div>
        </section>

        <section id="workflow" className="border-y border-warm-200 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 max-w-3xl">
              <span className="text-sm font-semibold uppercase text-accent-dark">完整流程</span>
              <h2 className="mt-3 text-5xl font-bold leading-tight text-warm-900">从上传图片开始，把上架内容一步步补齐</h2>
            </div>
            <div className="space-y-12">
              {workflow.map((step, index) => (
                <article key={step.title} className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-sm font-bold text-white">{index + 1}</span>
                    <h3 className="mt-6 text-3xl font-bold text-warm-900">{step.title}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-warm-600">{step.desc}</p>
                    <p className="mt-4 text-sm leading-relaxed text-warm-400">{step.detail}</p>
                  </div>
                  <FlowVisual type={step.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platforms" className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-sm font-semibold uppercase text-accent-dark">平台模板</span>
              <h2 className="mt-3 text-5xl font-bold leading-tight text-warm-900">不同平台，输出字段不能一样</h2>
              <p className="mt-4 text-base leading-relaxed text-warm-600">
                用户在生成前选择平台，AI 会按平台字段、转化场景和内容长度来写，不会把 Amazon 文案硬塞进独立站。
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {platformCards.map((item) => (
                <article key={item.name} className={`rounded-xl border p-5 ${item.color}`}>
                  <PlatformIcon type={item.key} />
                  <h3 className="mt-4 text-xl font-bold text-warm-900">{item.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-warm-700">{item.fields}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="models" className="bg-[#18251f] py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 max-w-3xl">
              <span className="text-sm font-semibold uppercase text-emerald-200">模型能力</span>
              <h2 className="mt-3 text-5xl font-bold leading-tight">未来可按任务路由到不同强模型</h2>
              <p className="mt-4 text-base leading-relaxed text-emerald-50/75">
                图片理解、AI 追问、长文案生成、字段精修可以使用不同模型。用户看到的是稳定的产品体验，背后可以根据成本和质量切换模型。
              </p>
            </div>
            <div className="mb-8 flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-[#101113] p-2 shadow-2xl shadow-black/20">
              {modelBadges.map((item, index) => (
                <div key={item.key} className={`grid h-16 w-16 place-items-center rounded-2xl p-1.5 ${index === 0 ? "bg-white/10" : "bg-transparent"}`}>
                  <ModelIcon type={item.key} size={64} />
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {modelBadges.map((item) => (
                <article key={item.name} className="rounded-xl border border-white/15 bg-white/10 p-5">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#101113] p-2">
                    <ModelIcon type={item.key} size={80} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/70">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl border border-warm-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-warm-900">先把一个商品跑通，再批量上品</h2>
                <p className="mt-4 text-base leading-relaxed text-warm-600">
                  当前原型已经支持登录、额度、平台模板和生成历史。下一步可以继续加历史详情、复制导出、成本核算和真实微信登录。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/tool" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark">在线试用</Link>
                <Link href="/pricing" className="rounded-full border border-warm-300 px-6 py-3 text-sm font-semibold text-warm-700 hover:border-warm-500">价格占位</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-warm-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 text-sm text-warm-400 sm:flex-row">
          <span>Describely · AI 跨境 Listing 工作台</span>
          <div className="flex gap-4">
            <Link href="/tool" className="hover:text-warm-700">在线试用</Link>
            <Link href="/pricing" className="hover:text-warm-700">价格</Link>
            <Link href="/feedback" className="hover:text-warm-700">提建议</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
