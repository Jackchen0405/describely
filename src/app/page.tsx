"use client";

import { useState } from "react";
import { TargetMarket, ImageAnalysis, GeneratedProduct, MarketConfig, FollowUpQuestion } from "@/types";
import ProductForm from "@/components/ProductForm";
import FollowUpQuestions from "@/components/FollowUpQuestions";
import GeneratedResults from "@/components/GeneratedResults";

type Step = "form" | "questions" | "results";

interface BasicInfo {
  name: string;
  category: string;
  targetMarket: TargetMarket;
  productCost?: number;
  shippingCost?: number;
  profitMargin?: number;
  imageBase64?: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  // Step 1 → 2 之间保留的数据
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [hasVision, setHasVision] = useState(false);

  // Step 2 → 3 之间保留的数据：用户填的答案
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});

  // Step 3 结果
  const [result, setResult] = useState<GeneratedProduct | null>(null);
  const [market, setMarket] = useState<MarketConfig | null>(null);

  // Step 1 → Step 2
  const handleBasicSubmit = async (data: BasicInfo) => {
    setBasicInfo(data);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "分析失败");
      }
      const json = await res.json();
      setQuestions(json.questions);
      setImageAnalysis(json.imageAnalysis);
      setHasVision(json.hasVision);
      setSavedAnswers({}); // 清空旧答案
      setStep("questions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Step 3
  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!basicInfo) return;
    setSavedAnswers(answers);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: basicInfo.name,
          category: basicInfo.category,
          targetMarket: basicInfo.targetMarket,
          productCost: basicInfo.productCost,
          shippingCost: basicInfo.shippingCost,
          profitMargin: basicInfo.profitMargin,
          answers,
          imageAnalysis,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }
      const json = await res.json();
      setResult(json.result);
      setMarket(json.market);
      setStep("results");
    } catch (err) {
      alert(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 从结果页回退到追问页，保留已填答案
  const handleBackToQuestions = () => {
    setStep("questions");
  };

  // 从追问页回退到基本信息页
  const handleBackToForm = () => setStep("form");

  // 重置全部
  const handleReset = () => {
    setStep("form");
    setBasicInfo(null);
    setQuestions([]);
    setSavedAnswers({});
    setImageAnalysis(null);
    setHasVision(false);
    setResult(null);
    setMarket(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-zinc-900">Describely</span>
            <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">Beta</span>
          </div>
          <span className="text-xs text-zinc-400">AI 电商文案 + SEO 套件 · 多市场</span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(["form", "questions", "results"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === s
                  ? "bg-zinc-900 text-white"
                  : step > s
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-100 text-zinc-400"
              }`}>
                {step > s ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${step === s ? "text-zinc-700 font-medium" : "text-zinc-400"}`}>
                {s === "form" ? "基本信息" : s === "questions" ? "AI 追问" : "生成结果"}
              </span>
              {i < 2 && <div className="w-6 h-px bg-zinc-200" />}
            </div>
          ))}
        </div>

        {step === "form" && (
          <ProductForm onSubmit={handleBasicSubmit} loading={loading} />
        )}
        {step === "questions" && basicInfo && (
          <FollowUpQuestions
            name={basicInfo.name}
            category={basicInfo.category}
            targetMarket={basicInfo.targetMarket}
            questions={questions}
            imageAnalysis={imageAnalysis}
            hasVision={hasVision}
            loading={loading}
            initialAnswers={savedAnswers}
            onSubmit={handleQuestionsSubmit}
            onBack={handleBackToForm}
          />
        )}
        {step === "results" && result && market && (
          <GeneratedResults
            result={result}
            imageAnalysis={imageAnalysis}
            hasVision={hasVision}
            market={market}
            onReset={handleReset}
            onBack={handleBackToQuestions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 mt-20">
        <div className="mx-auto max-w-2xl px-6 py-6 text-center text-xs text-zinc-400">
          Describely · AI 电商文案助手 · 多市场深度生成
        </div>
      </footer>
    </div>
  );
}
