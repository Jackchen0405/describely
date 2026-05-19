import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import TawkWidget from "@/components/TawkWidget";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "buluba — AI跨境商品文案助手",
  description: "为中国跨境卖家生成有场景、有卖点、有转化张力的商品标题、五点描述、SEO和平台上架文案。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-cream text-warm-900">
        <AuthProvider>{children}</AuthProvider>
        <TawkWidget />
      </body>
    </html>
  );
}
