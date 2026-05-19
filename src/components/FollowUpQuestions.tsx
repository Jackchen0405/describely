"use client";

import { useRef } from "react";
import { FollowUpQuestion, ImageAnalysis, PlatformId, TargetMarket } from "@/types";
import { MARKETS } from "@/lib/markets";
import { PLATFORMS } from "@/lib/platforms";

interface Props {
  name: string;
  category: string;
  targetMarket: TargetMarket;
  platform: PlatformId;
  questions: FollowUpQuestion[];
  imageAnalysis: ImageAnalysis | null;
  hasVision: boolean;
  loading: boolean;
  initialAnswers?: Record<string, string>;
  onSubmit: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export default function FollowUpQuestions({
  name,
  category,
  targetMarket,
  platform,
  questions,
  imageAnalysis,
  hasVision,
  loading,
  initialAnswers,
  onSubmit,
  onBack,
}: Props) {
  const refs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const otherRef = useRef<HTMLTextAreaElement>(null);
  const competitorRef = useRef<HTMLTextAreaElement>(null);
  const market = MARKETS[targetMarket];
  const platformConfig = PLATFORMS[platform];

  const handleSubmit = () => {
    const answers: Record<string, string> = {};
    for (const q of questions) {
      const el = refs.current.get(q.id);
      const val = el?.value?.trim() || "";
      if (val) answers[q.id] = val;
    }
    const otherVal = otherRef.current?.value?.trim() || "";
    if (otherVal) answers["_other"] = otherVal;
    const competitorVal = competitorRef.current?.value?.trim() || "";
    if (competitorVal) answers["_competitorReviews"] = competitorVal;
    onSubmit(answers);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-warm-900">AI 需要了解更多细节</h2>
          <p className="text-sm text-warm-500 mt-1">
            根据「{name}」的品类（{category}）、{market.country}市场和 {platformConfig.name} 平台，AI 生成了以下追问。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-warm-200 bg-white px-3 py-1 text-xs text-warm-500">{market.language}</span>
            <span className="rounded-full border border-warm-200 bg-white px-3 py-1 text-xs text-warm-500">{platformConfig.description}</span>
          </div>
        </div>
      </div>

      {/* 图片分析结果 */}
      {imageAnalysis && hasVision && (
        <div className="rounded-xl border border-accent-light/40 bg-accent-light/10 p-4">
          <span className="text-xs font-medium text-accent-dark uppercase tracking-wide">AI 图片分析</span>
          <p className="text-sm text-warm-700 mt-1">
            识别品类：{imageAnalysis.productType}
            {imageAnalysis.features?.length > 0 && ` · 特征：${imageAnalysis.features.join("、")}`}
          </p>
          {imageAnalysis.suggestions && (
            <p className="text-xs text-warm-600 mt-1">{imageAnalysis.suggestions}</p>
          )}
        </div>
      )}

      {/* 追问列表 */}
      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={q.id}>
            <label className="text-sm font-medium text-warm-700">
              {i + 1}. {q.question}
            </label>
            <input
              ref={(el) => { if (el) refs.current.set(q.id, el); }}
              defaultValue={initialAnswers?.[q.id] || ""}
              placeholder={q.hint}
              className="mt-1.5 w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none bg-white shadow-sm transition-all"
            />
          </div>
        ))}

        {/* 自由补充 */}
        <div>
          <label className="text-sm font-medium text-warm-500">
            其他补充信息（可选）
          </label>
          <p className="text-xs text-warm-400 mb-1.5">如果以上问题没有覆盖到你想强调的卖点，请在这里自由补充。</p>
          <textarea
            ref={otherRef}
            defaultValue={initialAnswers?.["_other"] || ""}
            placeholder="例如：这款产品在去年的销售数据很好、有明星代言、获得过某个奖项…"
            rows={3}
            className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none bg-white shadow-sm transition-all resize-none"
          />
        </div>

        {/* 竞品差评 */}
        <div>
          <label className="text-sm font-medium text-warm-500">
            竞品差评参考（可选）
          </label>
          <p className="text-xs text-warm-400 mb-1.5">粘贴竞品1-2星差评原文，AI 会分析痛点并针对性强化你的文案卖点。</p>
          <textarea
            ref={competitorRef}
            defaultValue={initialAnswers?.["_competitorReviews"] || ""}
            placeholder="例如：&#34;The cup is way too small, can barely fit a regular coffee. The handle gets burning hot after 30 seconds in microwave...&#34;"
            rows={4}
            className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-4 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none resize-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="rounded-xl border border-warm-200 px-6 py-3 text-sm text-warm-600 hover:bg-warm-50 transition-all disabled:opacity-40 shadow-sm">
          返回修改基本信息
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 rounded-xl bg-gradient-to-r from-accent to-accent-dark py-3 text-sm font-semibold text-white hover:from-accent-dark hover:to-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 active:scale-[0.99]">
          {loading ? "AI 正在生成中…" : "生成全套文案"}
        </button>
      </div>
    </div>
  );
}
