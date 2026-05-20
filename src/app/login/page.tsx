"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type EmailStep = "email" | "code";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tool";
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [step, setStep] = useState<EmailStep>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginSuccess = async () => {
    await refreshUser();
    router.push(redirect);
  };

  const handleWechatLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/wechat", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "微信登录失败");
      await loginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "微信登录失败");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      setDevCode(data.devCode || "");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!email.trim() || !code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      await loginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-warm-900">BULUBA</Link>
          <Link href="/" className="text-sm text-warm-400 transition-colors hover:text-warm-700">返回首页</Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl place-items-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-2xl shadow-warm-900/10 md:grid-cols-[0.92fr_1.08fr]">
          <section className="bg-[#18251f] p-8 text-white sm:p-10">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-emerald-50/80">中国卖家友好的登录方式</span>
            <h1 className="mt-8 text-3xl font-bold leading-tight">登录后保存生成结果和试用额度</h1>
            <p className="mt-4 text-sm leading-relaxed text-emerald-50/75">
              第一版保持简单：微信扫码作为主入口，邮箱验证码作为备用。后续接入微信开放平台后，这里会变成真实扫码登录。
            </p>
            <div className="mt-8 space-y-3 text-sm text-emerald-50/80">
              <p>✓ 不需要复杂注册资料</p>
              <p>✓ 首次登录自动创建账号</p>
              <p>✓ 可用于额度、套餐和历史记录</p>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <div className="mx-auto max-w-sm">
              <h2 className="text-2xl font-bold text-warm-900">欢迎回来</h2>
              <p className="mt-2 text-sm text-warm-500">选择一种方式继续使用 BULUBA</p>

              <button
                onClick={handleWechatLogin}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1aad19] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#168f15] disabled:opacity-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1aad19]">微</span>
                微信扫码登录
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-warm-100" />
                <span className="text-xs text-warm-300">或使用邮箱验证码</span>
                <div className="h-px flex-1 bg-warm-100" />
              </div>

              {step === "email" ? (
                <div className="space-y-3">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="输入邮箱"
                    type="email"
                    className="w-full rounded-xl border border-warm-200 px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    onClick={sendCode}
                    disabled={loading || !email.trim()}
                    className="w-full rounded-xl border border-warm-300 px-4 py-3 text-sm font-semibold text-warm-700 transition-colors hover:border-accent disabled:opacity-50"
                  >
                    获取验证码
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="输入 6 位验证码"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-warm-200 px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    {devCode && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        开发模式验证码：{devCode}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={verifyCode}
                    disabled={loading || !code.trim()}
                    className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => { setStep("email"); setCode(""); }}
                    className="w-full text-xs text-warm-400 hover:text-warm-700"
                  >
                    换一个邮箱
                  </button>
                </div>
              )}

              {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <p className="mt-6 text-xs leading-relaxed text-warm-400">
                登录即表示你同意使用 BULUBA 保存必要账号信息，用于试用额度、套餐和生成历史。
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LoginContent />
    </Suspense>
  );
}
