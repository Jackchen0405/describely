"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import { GenerationHistoryEntry } from "@/types";
import { MARKETS } from "@/lib/markets";
import { PLATFORMS } from "@/lib/platforms";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<GenerationHistoryEntry[]>([]);
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">Describely</Link>
          <div className="flex items-center gap-3">
            <AuthStatus />
            <Link href="/tool" className="text-sm text-warm-400 hover:text-warm-700">继续生成</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-900">生成历史</h1>
          <p className="mt-2 text-sm text-warm-500">保存每次成功生成的商品文案，方便回看和复制。</p>
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
              <article key={entry.id} className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-warm-900">{entry.productName}</h2>
                    <p className="mt-1 text-xs text-warm-400">
                      {entry.category} · {MARKETS[entry.targetMarket]?.country} · {PLATFORMS[entry.platform]?.name} · {formatTime(entry.createdAt)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-warm-100 px-3 py-1 text-xs text-warm-500">
                    {entry.usage.inputTokens + entry.usage.outputTokens} tokens
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-warm-50 p-3">
                    <span className="text-xs font-medium text-warm-400">标题</span>
                    <p className="mt-1 text-sm font-medium text-warm-800">{entry.result.title}</p>
                  </div>
                  <div className="rounded-lg bg-warm-50 p-3">
                    <span className="text-xs font-medium text-warm-400">短描述</span>
                    <p className="mt-1 text-sm text-warm-700">{entry.result.shortDescription}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
