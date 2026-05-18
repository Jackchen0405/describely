"use client";

import { GeneratedProduct, ImageAnalysis, MarketConfig } from "@/types";
import { useState } from "react";

interface Props {
  result: GeneratedProduct;
  imageAnalysis: ImageAnalysis | null;
  hasVision: boolean;
  market: MarketConfig;
  onReset: () => void;
  onBack: () => void;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      onClick={() => { copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
    >
      {copied ? "✓ 已复制" : "复制"}
    </button>
  );
}

function CharCounter({ text, max }: { text: string; max: number }) {
  const len = text.length;
  const over = len > max;
  return (
    <span className={`text-xs ${over ? "text-red-500 font-medium" : "text-zinc-400"}`}>
      {len}/{max} {over ? "超了!" : ""}
    </span>
  );
}

export default function GeneratedResults({ result, imageAnalysis, hasVision, market, onReset, onBack }: Props) {
  const lim = market.charLimits;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">生成结果</h2>
          <p className="text-sm text-zinc-500">
            {market.country}市场 · {market.language} · {market.currencySymbol} {market.currency}
            {hasVision && imageAnalysis ? " · 已结合图片分析" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            返回修改
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            重新开始
          </button>
        </div>
      </div>

      {/* AI 图片分析 */}
      {imageAnalysis && (
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

      {/* 建议售价 */}
      {result.suggestedPrice && (
        <div className="rounded-lg border border-green-100 bg-green-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-600 uppercase tracking-wide">定价建议</span>
            <span className="text-xs text-green-500">基于{market.country}市场分析</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-green-800">{result.suggestedPrice.target}</span>
            <span className="text-sm text-green-600">{result.suggestedPrice.local}</span>
          </div>
          {result.suggestedPrice.note && (
            <p className="text-xs text-green-600 mt-1.5">{result.suggestedPrice.note}</p>
          )}
        </div>
      )}

      {/* 产品标题 */}
      <FieldBlock label="产品标题" copyText={result.title}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">SEO友好 · 融入关键词 · {market.language}</span>
          <CharCounter text={result.title} max={lim.title} />
        </div>
        <p className="text-base font-medium text-zinc-900 leading-relaxed">{result.title}</p>
      </FieldBlock>

      {/* 短描述 */}
      <FieldBlock label="短描述" copyText={result.shortDescription}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">一句话勾住买家</span>
          <CharCounter text={result.shortDescription} max={lim.shortDescription} />
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">{result.shortDescription}</p>
      </FieldBlock>

      {/* 长描述 */}
      <FieldBlock label="长描述" copyText={result.longDescription}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">讲故事 · 产品特点 · 购买理由</span>
          <CharCounter text={result.longDescription} max={lim.longDescription} />
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{result.longDescription}</p>
      </FieldBlock>

      {/* 产品 URL */}
      <FieldBlock label="产品 URL / Slug" copyText={result.productSlug}>
        <p className="text-sm text-zinc-600 font-mono">{result.productSlug}</p>
      </FieldBlock>

      {/* SEO 套件 */}
      <div className="rounded-lg border border-zinc-200 p-5 space-y-4 bg-zinc-50/50">
        <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          🔍 SEO 套件 · {market.seoLang}
        </h3>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">焦点关键词</span>
            <CharCounter text={result.seo.focusKeyword} max={lim.focusKeyword} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-800 font-medium">{result.seo.focusKeyword}</p>
            <CopyBtn text={result.seo.focusKeyword} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">SEO 标题</span>
            <CharCounter text={result.seo.seoTitle} max={lim.seoTitle} />
          </div>
          <div className="flex items-start gap-2">
            <p className="text-sm text-zinc-700">{result.seo.seoTitle}</p>
            <CopyBtn text={result.seo.seoTitle} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">别名</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-700">{result.seo.alias}</p>
            <CopyBtn text={result.seo.alias} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">元描述 (Meta Description)</span>
            <CharCounter text={result.seo.metaDescription} max={lim.metaDescription} />
          </div>
          <div className="flex items-start gap-2">
            <p className="text-sm text-zinc-600 leading-relaxed">{result.seo.metaDescription}</p>
            <CopyBtn text={result.seo.metaDescription} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({ label, copyText, children }: { label: string; copyText: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
        <CopyBtn text={copyText} />
      </div>
      {children}
    </div>
  );
}
