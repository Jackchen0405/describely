"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-warm-400">加载中</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="rounded-full border border-warm-300 bg-white px-4 py-2 text-sm font-semibold text-warm-700 transition-colors hover:border-warm-500">
        登录
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/history" className="hidden text-right sm:block">
        <p className="text-sm font-medium text-warm-800">{user.name}</p>
        <p className="text-xs text-warm-400">剩余 {user.credits} 次 · 历史</p>
      </Link>
      <button
        onClick={() => void logout()}
        className="rounded-full border border-warm-300 bg-white px-4 py-2 text-sm font-semibold text-warm-600 transition-colors hover:border-warm-500"
      >
        退出
      </button>
    </div>
  );
}
