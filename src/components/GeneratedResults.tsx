"use client";

import { GeneratedProduct, ImageAnalysis, MarketConfig, TokenUsage } from "@/types";
import { useState, useRef, useEffect } from "react";

interface Props {
  result: GeneratedProduct;
  imageAnalysis: ImageAnalysis | null;
  hasVision: boolean;
  market: MarketConfig;
  productName: string;
  category: string;
  analyzeUsage: TokenUsage | null;
  generateUsage: TokenUsage | null;
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

function RevisePanel({
  fieldType,
  currentValue,
  charLimit,
  productName,
  category,
  language,
  onRevised,
  onClose,
}: {
  fieldType: string;
  currentValue: string;
  charLimit?: number;
  productName: string;
  category: string;
  language: string;
  onRevised: (value: string) => void;
  onClose: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!instruction.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldType,
          currentValue,
          instruction: instruction.trim(),
          productName,
          category,
          language,
          charLimit: charLimit ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "修改失败");
      }
      const json = await res.json();
      onRevised(json.revised);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "修改失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-indigo-600">AI 修改</span>
        <span className="text-xs text-indigo-400">描述你想要的变化</span>
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); }}
          placeholder="例如：更简短、突出环保材质、加入紧迫感…"
          className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-indigo-400 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim() || loading}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? "…" : "修改"}
        </button>
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function GeneratedResults({ result, imageAnalysis, hasVision, market, productName, category, analyzeUsage, generateUsage, onReset, onBack }: Props) {
  const lim = market.charLimits;
  const [revised, setRevised] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  const getValue = (key: string, fallback: string) => revised[key] ?? fallback;
  const handleRevised = (key: string, value: string) => setRevised(prev => ({ ...prev, [key]: value }));
  const bulletPoints = result.bulletPoints.map((bp, i) => getValue(`bullet-${i}`, bp));

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
          <button onClick={onBack} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">返回修改</button>
          <button onClick={onReset} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">重新开始</button>
        </div>
      </div>

      {imageAnalysis && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">AI 图片分析</span>
          <p className="text-sm text-blue-800 mt-1">
            识别品类：{imageAnalysis.productType}
            {imageAnalysis.features?.length > 0 && ` · 特征：${imageAnalysis.features.join("、")}`}
          </p>
          {imageAnalysis.suggestions && <p className="text-xs text-blue-600 mt-1">{imageAnalysis.suggestions}</p>}
        </div>
      )}

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
          {result.suggestedPrice.note && <p className="text-xs text-green-600 mt-1.5">{result.suggestedPrice.note}</p>}
        </div>
      )}

      {/* 产品标题 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">产品标题</span>
          <div className="flex items-center gap-1">
            {!activeField && (
              <button onClick={() => setActiveField("title")} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">修改</button>
            )}
            <CopyBtn text={getValue("title", result.title)} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">SEO友好 · 融入关键词 · {market.language}</span>
          <CharCounter text={getValue("title", result.title)} max={lim.title} />
        </div>
        <p className="text-base font-medium text-zinc-900 leading-relaxed">{getValue("title", result.title)}</p>
        {activeField === "title" && (
          <RevisePanel fieldType="title" currentValue={getValue("title", result.title)} charLimit={lim.title} productName={productName} category={category} language={market.language} onRevised={(v) => handleRevised("title", v)} onClose={() => setActiveField(null)} />
        )}
      </div>

      {/* 短描述 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">短描述</span>
          <div className="flex items-center gap-1">
            {!activeField && (
              <button onClick={() => setActiveField("shortDescription")} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">修改</button>
            )}
            <CopyBtn text={getValue("shortDescription", result.shortDescription)} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">一句话勾住买家</span>
          <CharCounter text={getValue("shortDescription", result.shortDescription)} max={lim.shortDescription} />
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed">{getValue("shortDescription", result.shortDescription)}</p>
        {activeField === "shortDescription" && (
          <RevisePanel fieldType="shortDescription" currentValue={getValue("shortDescription", result.shortDescription)} charLimit={lim.shortDescription} productName={productName} category={category} language={market.language} onRevised={(v) => handleRevised("shortDescription", v)} onClose={() => setActiveField(null)} />
        )}
      </div>

      {/* 五点描述 */}
      {bulletPoints.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">五点描述</span>
              <span className="text-xs text-zinc-400 ml-2">亚马逊核心转化模块，5条差异化卖点覆盖功能、质量、场景、售后、情感</span>
            </div>
            <CopyBtn text={bulletPoints.join("\n")} />
          </div>
          <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
            {bulletPoints.map((bp, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <span className="text-xs font-bold text-zinc-400 mt-0.5 shrink-0">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 leading-relaxed">{bp}</p>
                  {activeField === `bullet-${i}` && (
                    <RevisePanel fieldType="bulletPoint" currentValue={bp} charLimit={lim.bulletPoint} productName={productName} category={category} language={market.language} onRevised={(v) => handleRevised(`bullet-${i}`, v)} onClose={() => setActiveField(null)} />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {activeField !== `bullet-${i}` && (
                    <button onClick={() => setActiveField(`bullet-${i}`)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">修改</button>
                  )}
                  <CharCounter text={bp} max={lim.bulletPoint} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 长描述 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">长描述</span>
          <div className="flex items-center gap-1">
            {!activeField && (
              <button onClick={() => setActiveField("longDescription")} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">修改</button>
            )}
            <CopyBtn text={getValue("longDescription", result.longDescription)} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">讲故事 · 产品特点 · 购买理由</span>
          <CharCounter text={getValue("longDescription", result.longDescription)} max={lim.longDescription} />
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{getValue("longDescription", result.longDescription)}</p>
        {activeField === "longDescription" && (
          <RevisePanel fieldType="longDescription" currentValue={getValue("longDescription", result.longDescription)} charLimit={lim.longDescription} productName={productName} category={category} language={market.language} onRevised={(v) => handleRevised("longDescription", v)} onClose={() => setActiveField(null)} />
        )}
      </div>

      {/* 后台搜索词 */}
      {result.backendKeywords && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">后台搜索词</span>
            <CopyBtn text={result.backendKeywords} />
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400">买家不可见，仅供搜索引擎索引。同义词、拼写变体、外语词、长尾词</span>
            <CharCounter text={result.backendKeywords} max={lim.backendKeywords} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.backendKeywords.split(/[,，]/).map(s => s.trim()).filter(Boolean).map((kw, i) => (
              <span key={i} className="inline-block rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-600 font-mono">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* 竞品分析 */}
      {result.competitorInsights && result.competitorInsights !== "无竞品数据" && (
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">竞品差评分析</span>
            <CopyBtn text={result.competitorInsights} />
          </div>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">{result.competitorInsights}</p>
        </div>
      )}

      {/* A+ 内容 */}
      {(result.aPlusContent.brandStory || result.aPlusContent.featureModules.length > 0) && (
        <div className="rounded-lg border border-zinc-200 p-5 space-y-4 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-800">A+ 内容 / EBC</h3>
            <span className="text-xs text-zinc-400">品牌展示模块 · {market.language}</span>
            <div className="flex-1" />
            <CopyBtn text={[
              result.aPlusContent.brandStory,
              ...result.aPlusContent.featureModules.map(m => `【${m.title}】${m.body}`)
            ].filter(Boolean).join("\n\n")} />
          </div>
          {result.aPlusContent.brandStory && (
            <div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">品牌故事</span>
              <p className="text-sm text-zinc-700 mt-1 leading-relaxed">{result.aPlusContent.brandStory}</p>
            </div>
          )}
          {result.aPlusContent.featureModules.map((mod, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-500">模块 {i + 1}</span>
                <CharCounter text={mod.title} max={lim.aPlusModuleTitle} />
              </div>
              <p className="text-sm font-medium text-zinc-800">{mod.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-zinc-400">&nbsp;</span>
                <CharCounter text={mod.body} max={lim.aPlusModuleBody} />
              </div>
              <p className="text-sm text-zinc-600 mt-0.5 leading-relaxed">{mod.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* 产品 URL */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">产品 URL / Slug</span>
          <CopyBtn text={result.productSlug} />
        </div>
        <p className="text-sm text-zinc-600 font-mono">{result.productSlug}</p>
      </div>

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

      {/* Token 消耗统计（仅开发模式） */}
      {typeof window !== "undefined" && window.location.hostname === "localhost" && (
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/30 p-4">
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">🔧 开发模式 · Token 消耗</span>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {analyzeUsage && (
              <div>
                <span className="text-xs text-amber-700">AI 追问</span>
                <p className="text-sm font-mono text-amber-900">输入 {(analyzeUsage.inputTokens || 0).toLocaleString()}</p>
                <p className="text-sm font-mono text-amber-900">输出 {(analyzeUsage.outputTokens || 0).toLocaleString()}</p>
              </div>
            )}
            {generateUsage && (
              <div>
                <span className="text-xs text-amber-700">文案生成</span>
                <p className="text-sm font-mono text-amber-900">输入 {(generateUsage.inputTokens || 0).toLocaleString()}</p>
                <p className="text-sm font-mono text-amber-900">输出 {(generateUsage.outputTokens || 0).toLocaleString()}</p>
              </div>
            )}
            {analyzeUsage && generateUsage && (
              <div>
                <span className="text-xs text-amber-700">合计</span>
                <p className="text-sm font-mono font-medium text-amber-900">
                  {((analyzeUsage.inputTokens || 0) + (generateUsage.inputTokens || 0) +
                    (analyzeUsage.outputTokens || 0) + (generateUsage.outputTokens || 0)).toLocaleString()} tokens
                </p>
                <CostEstimate analyzeUsage={analyzeUsage} generateUsage={generateUsage} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CostEstimate({ analyzeUsage, generateUsage }: { analyzeUsage: TokenUsage; generateUsage: TokenUsage }) {
  const totalInput = (analyzeUsage.inputTokens || 0) + (generateUsage.inputTokens || 0);
  const totalOutput = (analyzeUsage.outputTokens || 0) + (generateUsage.outputTokens || 0);
  const costCNY = (totalInput / 1_000_000) * 1 + (totalOutput / 1_000_000) * 2;
  return (
    <p className="text-xs text-amber-600 mt-0.5">
      约 ¥{costCNY.toFixed(4)}（DeepSeek）
    </p>
  );
}
