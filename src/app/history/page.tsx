"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import { GenerationHistoryEntry } from "@/types";
import { MARKETS } from "@/lib/markets";
import { PLATFORMS } from "@/lib/platforms";

const styleLabels: Record<string, string> = {
  conversion: "稳妥转化型",
  emotional: "情绪种草型",
  brand: "品牌质感型",
  test: "爆款测试型",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text);
}

function cleanGeneratedText(text?: string) {
  return (text || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() => {
        copyToClipboard(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="rounded-full border border-warm-200 bg-white px-3 py-1 text-xs font-medium text-warm-500 transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function Section({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  const copyText = cleanGeneratedText(text);
  return (
    <section className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-warm-900">{title}</h3>
        <CopyButton text={copyText} />
      </div>
      {children || <p className="whitespace-pre-line text-sm leading-7 text-warm-700">{cleanGeneratedText(text)}</p>}
    </section>
  );
}

function entryToText(entry: GenerationHistoryEntry) {
  const r = entry.result;
  return [
    `产品：${entry.productName}`,
    `品类：${entry.category}`,
    `标题：${cleanGeneratedText(r.title)}`,
    `短描述：${cleanGeneratedText(r.shortDescription)}`,
    `五点描述：\n${r.bulletPoints.map((bp, i) => `${i + 1}. ${cleanGeneratedText(bp)}`).join("\n")}`,
    `长描述：\n${cleanGeneratedText(r.longDescription)}`,
    `后台搜索词：${cleanGeneratedText(r.backendKeywords)}`,
    `SEO：\n焦点关键词：${cleanGeneratedText(r.seo.focusKeyword)}\nSEO标题：${cleanGeneratedText(r.seo.seoTitle)}\n别名：${cleanGeneratedText(r.seo.alias)}\n元描述：${cleanGeneratedText(r.seo.metaDescription)}`,
    `平台字段：\n${(r.platformFields || []).map((field) => `${field.label}: ${cleanGeneratedText(field.value)}`).join("\n")}`,
  ].filter(Boolean).join("\n\n");
}

function HistoryDetail({ entry, onBack }: { entry: GenerationHistoryEntry; onBack: () => void }) {
  const result = entry.result;
  const market = MARKETS[entry.targetMarket];
  const platform = PLATFORMS[entry.platform];
  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-sm font-medium text-warm-500 hover:text-warm-900">
        ← 返回历史列表
      </button>

      <div className="rounded-3xl border border-warm-200 bg-[#18251f] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-200">历史详情</span>
            <h1 className="mt-2 text-3xl font-bold">{entry.productName}</h1>
            <p className="mt-2 text-sm text-white/65">
              {entry.category} · {market?.country} · {platform?.name} · {formatTime(entry.createdAt)}
              {entry.copywritingStyle ? ` · ${styleLabels[entry.copywritingStyle] || entry.copywritingStyle}` : ""}
            </p>
          </div>
          <CopyButton text={entryToText(entry)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Section title="产品标题" text={result.title} />
        <Section title="短描述" text={result.shortDescription} />
      </div>

      <Section title="五点描述" text={result.bulletPoints.join("\n")}>
        <div className="space-y-3">
          {result.bulletPoints.map((point, index) => (
            <div key={index} className="rounded-xl bg-warm-50 p-4">
              <span className="text-xs font-bold text-accent">0{index + 1}</span>
              <p className="mt-1 text-sm leading-7 text-warm-700">{cleanGeneratedText(point)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="长描述" text={result.longDescription} />

      {result.platformFields && result.platformFields.length > 0 && (
        <Section title={`${platform?.name || "平台"}字段`} text={result.platformFields.map((field) => `${field.label}: ${cleanGeneratedText(field.value)}`).join("\n")}>
          <div className="grid gap-3 md:grid-cols-2">
            {result.platformFields.map((field, index) => (
              <div key={`${field.label}-${index}`} className="rounded-xl bg-warm-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-warm-500">{field.label}</span>
                  <CopyButton text={cleanGeneratedText(field.value)} />
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-warm-700">{cleanGeneratedText(field.value)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="后台搜索词" text={result.backendKeywords} />
        <Section title="SEO 套件" text={`焦点关键词：${result.seo.focusKeyword}\nSEO标题：${result.seo.seoTitle}\n别名：${result.seo.alias}\n元描述：${result.seo.metaDescription}`} />
      </div>

      {(result.aPlusContent.brandStory || result.aPlusContent.featureModules.length > 0) && (
        <Section
          title="A+ / EBC 内容"
          text={[
            result.aPlusContent.brandStory,
            ...result.aPlusContent.featureModules.map((mod) => `${mod.title}\n${mod.body}`),
          ].join("\n\n")}
        >
          <div className="space-y-4">
            {result.aPlusContent.brandStory && (
              <div>
                <span className="text-xs font-semibold text-warm-400">品牌故事</span>
                <p className="mt-1 text-sm leading-7 text-warm-700">{result.aPlusContent.brandStory}</p>
              </div>
            )}
            {result.aPlusContent.featureModules.map((mod, index) => (
              <div key={index} className="rounded-xl bg-warm-50 p-4">
                <h4 className="text-sm font-bold text-warm-900">{mod.title}</h4>
                <p className="mt-1 text-sm leading-7 text-warm-700">{mod.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {result.suggestedPrice && (
          <Section title="定价建议" text={`${result.suggestedPrice.target}\n${result.suggestedPrice.local}\n${result.suggestedPrice.note}`} />
        )}
        {result.competitorInsights && (
          <Section title="竞品差评分析" text={result.competitorInsights} />
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<GenerationHistoryEntry[]>([]);
  const [selected, setSelected] = useState<GenerationHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      try {
        const res = await fetch("/api/history", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "读取失败");
        if (!ignore) setEntries(data.entries || []);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "读取失败");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadHistory();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">buluba</Link>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="text-sm text-warm-400 hover:text-warm-700">继续生成</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {selected ? (
          <HistoryDetail entry={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-warm-900">生成历史</h1>
              <p className="mt-2 text-sm text-warm-500">查看每次成功生成的完整 Listing，包括五点、长描述、平台字段、SEO 和定价建议。</p>
            </div>

            {loading ? (
              <p className="text-sm text-warm-400">加载中...</p>
            ) : error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm text-amber-800">{error}</p>
                <Link href="/login?redirect=/history" className="mt-3 inline-block rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white">去登录</Link>
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-xl border border-warm-200 bg-white p-10 text-center">
                <p className="text-warm-700">还没有生成记录</p>
                <Link href="/tool" className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">生成第一套文案</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <article key={entry.id} className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition-all hover:border-accent-light hover:shadow-md">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-warm-900">{entry.productName}</h2>
                        <p className="mt-1 text-xs text-warm-400">
                          {entry.category} · {MARKETS[entry.targetMarket]?.country} · {PLATFORMS[entry.platform]?.name} · {formatTime(entry.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.copywritingStyle && (
                          <span className="rounded-full bg-accent-light/30 px-3 py-1 text-xs text-accent-dark">
                            {styleLabels[entry.copywritingStyle] || entry.copywritingStyle}
                          </span>
                        )}
                        <span className="rounded-full bg-warm-100 px-3 py-1 text-xs text-warm-500">
                          {entry.usage.inputTokens + entry.usage.outputTokens} tokens
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-warm-50 p-3">
                        <span className="text-xs font-medium text-warm-400">标题</span>
                        <p className="mt-1 text-sm font-medium text-warm-800">{entry.result.title}</p>
                      </div>
                      <div className="rounded-xl bg-warm-50 p-3">
                        <span className="text-xs font-medium text-warm-400">短描述</span>
                        <p className="mt-1 text-sm text-warm-700">{entry.result.shortDescription}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(entry);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="mt-4 rounded-full bg-warm-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                    >
                      查看完整内容
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
