"use client";

import { useRef } from "react";
import { FollowUpQuestion, ImageAnalysis, TargetMarket } from "@/types";

interface Props {
  name: string;
  category: string;
  targetMarket: TargetMarket;
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
  questions,
  imageAnalysis,
  hasVision,
  loading,
  initialAnswers,
  onSubmit,
  onBack,
}: Props) {
  const refs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleSubmit = () => {
    const answers: Record<string, string> = {};
    for (const q of questions) {
      const el = refs.current.get(q.id);
      const val = el?.value?.trim() || "";
      if (val) answers[q.id] = val;
    }
    onSubmit(answers);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">AI 需要了解更多细节</h2>
          <p className="text-sm text-zinc-500 mt-1">
            根据「{name}」的品类（{category}），AI 生成了以下追问，帮我们写出更精准的文案。
          </p>
        </div>
      </div>

      {/* 图片分析结果 */}
      {imageAnalysis && hasVision && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">AI 图片分析</span>
          <p className="text-sm text-blue-800 mt-1">
            识别品类：{imageAnalysis.productType}
            {imageAnalysis.features?.length > 0 && ` · 特征：${imageAnalysis.features.join("、")}`}
          </p>
          {imageAnalysis.suggestions && (
            <p className="text-xs text-blue-600 mt-1">{imageAnalysis.suggestions}</p>
          )}
        </div>
      )}

      {/* 追问列表 */}
      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={q.id}>
            <label className="text-sm font-medium text-zinc-700">
              {i + 1}. {q.question}
            </label>
            <input
              ref={(el) => { if (el) refs.current.set(q.id, el); }}
              defaultValue={initialAnswers?.[q.id] || ""}
              placeholder={q.hint}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="rounded-lg border border-zinc-200 px-6 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40">
          返回修改基本信息
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {loading ? "AI 正在生成中…" : "生成全套文案"}
        </button>
      </div>
    </div>
  );
}
