"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FeedbackEntry {
  id: string;
  content: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadEntries() {
      try {
        const res = await fetch("/api/feedback");
        if (res.ok && !ignore) {
          const data = await res.json();
          setEntries(data);
        }
      } catch {
        // 静默失败
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadEntries();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "提交失败");
      }
      setText("");
      await fetchEntries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold text-warm-900 hover:text-warm-700 transition-colors">
              Describely
            </Link>
            <span className="text-xs text-warm-400 bg-warm-100 rounded-full px-2 py-0.5">Beta</span>
          </div>
          <Link href="/" className="text-xs text-warm-400 hover:text-warm-600 transition-colors">
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-xl font-bold text-warm-900 mb-2">意见反馈</h1>
        <p className="text-sm text-warm-500 mb-8">说说你的想法、需求或遇到的问题，所有用户都能看到</p>

        {/* 发表评论 */}
        <div className="mb-10">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="写下你的建议…"
            className="w-full h-28 rounded-xl border border-warm-200 p-3 text-sm text-warm-800 placeholder:text-warm-400 resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-warm-400">{text.length}/1000</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="rounded-xl bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中…" : "发表"}
            </button>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-warm-500">
            全部反馈（{entries.length}）
          </h2>

          {loading ? (
            <p className="text-sm text-warm-400">加载中…</p>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">💬</span>
              <p className="text-warm-400 text-sm mt-3">还没有反馈，来当第一个吧</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-warm-200 p-4">
                <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                <span className="text-xs text-warm-400 mt-2 block">{formatTime(entry.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
