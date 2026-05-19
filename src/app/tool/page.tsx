"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import { useAuth } from "@/components/AuthProvider";
import { TargetMarket, ImageAnalysis, GeneratedProduct, MarketConfig, FollowUpQuestion, TokenUsage, PlatformId } from "@/types";
import ProductForm from "@/components/ProductForm";
import FollowUpQuestions from "@/components/FollowUpQuestions";
import GeneratedResults from "@/components/GeneratedResults";

type Step = "form" | "questions" | "results";
type LoadingMode = "analyze" | "generate" | null;

const steps: { id: Step; title: string; desc: string }[] = [
  { id: "form", title: "商品资料", desc: "图片、市场、平台、成本" },
  { id: "questions", title: "AI 追问", desc: "补齐关键卖点" },
  { id: "results", title: "生成结果", desc: "复制、修改、保存历史" },
];

const loadingMessages = {
  analyze: [
    "正在理解商品资料",
    "正在匹配目标市场表达习惯",
    "正在整理平台字段重点",
    "正在准备更有用的追问",
  ],
  generate: [
    "正在整理你的回答",
    "正在生成标题和五点描述",
    "正在补充 SEO 和后台词",
    "正在检查平台字段结构",
  ],
};

function LoadingPanel({ mode }: { mode: Exclude<LoadingMode, null> }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = loadingMessages[mode];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-accent-light bg-accent-light/15 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.2)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-warm-900">
            {mode === "analyze" ? "AI 正在查看商品资料" : "AI 正在生成全套 Listing"}
          </p>
          <p className="mt-1 text-sm text-warm-500">{messages[messageIndex]}...</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-accent-light via-accent to-accent-light animate-[pulse_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface BasicInfo {
  name: string;
  category: string;
  targetMarket: TargetMarket;
  platform: PlatformId;
  productCost?: number;
  shippingCost?: number;
  profitMargin?: number;
  imageBase64s?: string[];
}

export default function ToolPage() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<LoadingMode>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [hasVision, setHasVision] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [analyzeUsage, setAnalyzeUsage] = useState<TokenUsage | null>(null);
  const [generateUsage, setGenerateUsage] = useState<TokenUsage | null>(null);
  const [result, setResult] = useState<GeneratedProduct | null>(null);
  const [market, setMarket] = useState<MarketConfig | null>(null);

  const handleBasicSubmit = async (data: BasicInfo) => {
    setBasicInfo(data);
    setLoading(true);
    setLoadingMode("analyze");
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "分析失败"); }
      const json = await res.json();
      setQuestions(json.questions);
      setImageAnalysis(json.imageAnalysis);
      setHasVision(json.hasVision);
      setAnalyzeUsage(json.usage || null);
      setSavedAnswers({});
      setStep("questions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "分析失败，请重试");
    } finally { setLoading(false); setLoadingMode(null); }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!basicInfo) return;
    if (!user) {
      window.location.href = "/login?redirect=/tool";
      return;
    }
    if (user.credits <= 0) {
      alert("试用额度已用完，请稍后升级套餐后继续使用。");
      return;
    }
    setSavedAnswers(answers);
    setLoading(true);
    setLoadingMode("generate");
    const competitorReviews = answers["_competitorReviews"] || undefined;
    const cleanAnswers = { ...answers };
    delete cleanAnswers["_competitorReviews"];
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: basicInfo.name, category: basicInfo.category, targetMarket: basicInfo.targetMarket, platform: basicInfo.platform, productCost: basicInfo.productCost, shippingCost: basicInfo.shippingCost, profitMargin: basicInfo.profitMargin, answers: cleanAnswers, competitorReviews, imageAnalysis }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "生成失败"); }
      const json = await res.json();
      setResult(json.result);
      setMarket(json.market);
      setGenerateUsage(json.usage || null);
      await refreshUser();
      setStep("results");
    } catch (err) {
      alert(err instanceof Error ? err.message : "生成失败，请重试");
    } finally { setLoading(false); setLoadingMode(null); }
  };

  const handleBackToQuestions = () => setStep("questions");
  const handleBackToForm = () => setStep("form");
  const handleReset = () => {
    setStep("form"); setBasicInfo(null); setQuestions([]); setSavedAnswers({});
    setImageAnalysis(null); setHasVision(false); setResult(null); setMarket(null);
    setAnalyzeUsage(null); setGenerateUsage(null);
  };
  const handleNextProduct = () => {
    handleReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fbf7f0]">
      <header className="sticky top-0 z-20 border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold text-warm-900 tracking-tight hover:text-accent transition-colors">Describely</Link>
            <span className="hidden rounded-full bg-warm-100 px-2 py-0.5 text-xs font-medium text-warm-500 sm:inline">Listing Workspace</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AuthStatus />
            <Link href="/" className="hidden text-xs text-warm-400 transition-colors hover:text-warm-600 sm:inline">← 返回首页</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr_300px]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase text-accent-dark">AI Listing 工作台</span>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-warm-900">从商品资料到可上架文案</h1>
            <p className="mt-3 text-sm leading-relaxed text-warm-500">先上传图片和基础信息，AI 会追问，再生成平台专用 Listing。</p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              {steps.map((item, index) => {
                const active = step === item.id;
                const done = steps.findIndex((s) => s.id === step) > index;
                return (
                  <div key={item.id} className={`rounded-xl border p-3 transition-all ${active ? "border-accent bg-accent/10" : done ? "border-emerald-200 bg-emerald-50" : "border-warm-100 bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${active ? "bg-accent text-white" : done ? "bg-emerald-500 text-white" : "bg-warm-100 text-warm-400"}`}>
                        {done ? "✓" : index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-warm-900">{item.title}</p>
                        <p className="text-xs text-warm-400">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 shadow-sm ${user ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            {user ? (
              <>
                <p className="text-sm font-semibold text-emerald-900">剩余 {user.credits} 次生成额度</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-700">AI 追问不扣额度，生成完整文案扣 1 次。</p>
                <Link href="/history" className="mt-3 inline-block rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800">查看历史</Link>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-900">登录后保存结果</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-700">可以先填写资料，生成前会引导登录。</p>
                <Link href="/login?redirect=/tool" className="mt-3 inline-block rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white">去登录</Link>
              </>
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-3xl border border-warm-200 bg-white p-5 shadow-xl shadow-warm-900/5 sm:p-8">
          {loadingMode && <LoadingPanel mode={loadingMode} />}
          {step === "form" && <ProductForm onSubmit={handleBasicSubmit} loading={loading} />}
          {step === "questions" && basicInfo && <FollowUpQuestions name={basicInfo.name} category={basicInfo.category} targetMarket={basicInfo.targetMarket} platform={basicInfo.platform} questions={questions} imageAnalysis={imageAnalysis} hasVision={hasVision} loading={loading} initialAnswers={savedAnswers} onSubmit={handleQuestionsSubmit} onBack={handleBackToForm} />}
          {step === "results" && result && market && basicInfo && <GeneratedResults result={result} imageAnalysis={imageAnalysis} hasVision={hasVision} market={market} productName={basicInfo.name} category={basicInfo.category} analyzeUsage={analyzeUsage} generateUsage={generateUsage} onReset={handleReset} onNextProduct={handleNextProduct} onBack={handleBackToQuestions} />}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-warm-200 bg-[#18251f] p-5 text-white shadow-sm">
            <span className="text-xs font-semibold uppercase text-emerald-200">当前任务</span>
            <h2 className="mt-2 text-lg font-bold">
              {step === "form" ? "补齐商品输入" : step === "questions" ? "回答 AI 追问" : "检查输出结果"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-50/75">
              {step === "form" ? "建议至少填写产品名、品类、目标市场和平台。图片越完整，追问越精准。" : step === "questions" ? "回答越具体，生成结果越像真正运营写出来的 Listing。" : "复制前先看字数、平台模板、SEO 和定价建议。"}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-warm-900">生成内容</h3>
            <div className="mt-4 space-y-3 text-sm text-warm-600">
              {["标题 / 短描述", "五点描述", "A+ 内容", "SEO 套件", "后台搜索词", "平台模板", "定价建议"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5">
            <h3 className="text-sm font-bold text-warm-900">小提示</h3>
            <p className="mt-2 text-sm leading-relaxed text-warm-500">竞品差评可以先不填，但如果你有 1-2 星差评原文，AI 会更容易找到反制卖点。</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
