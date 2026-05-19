"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { CopywritingStyle, PlatformId, TargetMarket } from "@/types";
import { MARKET_OPTIONS } from "@/lib/markets";
import { PLATFORM_OPTIONS } from "@/lib/platforms";

interface Props {
  onSubmit: (data: {
    name: string;
    category: string;
    targetMarket: TargetMarket;
    platform: PlatformId;
    copywritingStyle: CopywritingStyle;
    productCost?: number;
    shippingCost?: number;
    profitMargin?: number;
    imageBase64s?: string[];
  }) => void;
  loading: boolean;
}

const MAX_IMAGES = 4;
const IMAGE_SLOTS = ["主图", "细节图", "包装图", "场景图"];
const STYLE_OPTIONS: { id: CopywritingStyle; name: string; desc: string }[] = [
  { id: "conversion", name: "稳妥转化型", desc: "FAB + 场景 + 信任解除，适合 Amazon" },
  { id: "emotional", name: "情绪种草型", desc: "痛点火花 + 画面感，适合 TikTok Shop" },
  { id: "brand", name: "品牌质感型", desc: "品牌调性 + 身份感，适合独立站" },
  { id: "test", name: "爆款测试型", desc: "多角度卖点发散，适合批量测试" },
];

export default function ProductForm({ onSubmit, loading }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [market, setMarket] = useState<TargetMarket>("US");
  const [platform, setPlatform] = useState<PlatformId>("amazon");
  const [copywritingStyle, setCopywritingStyle] = useState<CopywritingStyle>("conversion");
  const [sellingPrice, setSellingPrice] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const productCostRef = useRef<HTMLInputElement>(null);
  const shippingCostRef = useRef<HTMLInputElement>(null);
  const profitMarginRef = useRef<HTMLInputElement>(null);

  const updatePrice = () => {
    const pc = parseFloat(productCostRef.current?.value || "0");
    const sc = parseFloat(shippingCostRef.current?.value || "0");
    const m = parseFloat(profitMarginRef.current?.value || "40");
    const totalCost = pc + sc;
    if (totalCost > 0) setSellingPrice((totalCost * (1 + m / 100)).toFixed(0));
    else setSellingPrice("");
  };

  const handleImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} 超过 5MB`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const name = nameRef.current?.value?.trim() || "";
    const category = categoryRef.current?.value?.trim() || "";

    if (!name || !category) { alert("请至少填写产品名和品类"); return; }

    const pcVal = productCostRef.current?.value;
    const scVal = shippingCostRef.current?.value;
    const pmVal = profitMarginRef.current?.value;

    onSubmit({
      name,
      category,
      targetMarket: market,
      platform,
      copywritingStyle,
      productCost: pcVal ? parseFloat(pcVal) : undefined,
      shippingCost: scVal ? parseFloat(scVal) : undefined,
      profitMargin: pmVal ? parseFloat(pmVal) : undefined,
      imageBase64s: images.length > 0 ? images : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-warm-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase text-accent-dark">Step 1 / Product Intake</span>
          <h2 className="mt-2 text-3xl font-bold tracking-normal text-warm-900">上传产品资料</h2>
          <p className="mt-2 text-sm text-warm-500">把图片、平台、市场和成本先整理好，AI 才能问出真正有用的问题。</p>
        </div>
        <div className="rounded-full border border-warm-200 bg-warm-50 px-4 py-2 text-xs font-medium text-warm-500">
          预计 2 分钟完成
        </div>
      </div>

      <section className="rounded-2xl border border-warm-200 bg-warm-50/50 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-warm-900">商品基础资料</h3>
            <p className="mt-1 text-sm text-warm-500">先让 AI 知道这是一个什么产品。</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-warm-400">必填</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-warm-700">产品名 <span className="text-red-400">*</span></label>
            <input ref={nameRef} defaultValue="" placeholder="如：中国手工石制茶宠摆件·钟馗"
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-warm-700">品类 <span className="text-red-400">*</span></label>
            <input ref={categoryRef} defaultValue="" placeholder="如：茶宠摆件"
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div className="rounded-xl border border-warm-200 bg-white px-4 py-3">
            <span className="text-xs font-medium text-warm-400">推荐填写方式</span>
            <p className="mt-1 text-sm text-warm-600">产品名尽量写清材质、用途和核心差异，后续 AI 会自动本地化。</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-warm-200 bg-white p-5">
        <div className="mb-5">
          <h3 className="text-base font-bold text-warm-900">文案风格强度</h3>
          <p className="mt-1 text-sm text-warm-500">让 AI 按不同平台和使用场景控制文案张力，不是一味写得夸张。</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCopywritingStyle(opt.id)}
              className={`rounded-xl border p-3 text-left transition-all ${
                copywritingStyle === opt.id
                  ? "border-accent bg-accent/10 shadow-sm ring-2 ring-accent/15"
                  : "border-warm-200 bg-warm-50/60 hover:border-accent-light"
              }`}
            >
              <span className="block text-sm font-semibold text-warm-800">{opt.name}</span>
              <span className="mt-1 block text-xs leading-5 text-warm-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-warm-200 bg-white p-5">
        <div className="mb-5">
          <h3 className="text-base font-bold text-warm-900">上架目标</h3>
          <p className="mt-1 text-sm text-warm-500">国家决定语言、币种和 SEO，平台决定字段结构。</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.3fr]">
          <div>
            <label className="text-sm font-medium text-warm-700">目标市场 <span className="text-red-400">*</span></label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as TargetMarket)}
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {MARKET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-warm-700">上架平台 <span className="text-red-400">*</span></label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlatform(opt.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    platform === opt.id
                      ? "border-accent bg-accent/10 shadow-sm ring-2 ring-accent/15"
                      : "border-warm-200 bg-white hover:border-accent-light"
                  }`}
                >
                  <span className="block text-sm font-semibold text-warm-800">{opt.shortName}</span>
                  <span className="mt-0.5 block text-xs text-warm-400">{opt.primaryUse}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-warm-200 bg-white p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-warm-900">图片素材</h3>
            <p className="mt-1 text-sm text-warm-500">建议上传主图、细节、包装、场景。没有图片也可以继续。</p>
          </div>
          <span className="text-xs text-warm-400">{images.length}/{MAX_IMAGES} 已上传</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {IMAGE_SLOTS.map((slot, i) => {
            const img = images[i];
            return (
              <div key={slot} className="relative">
                {img ? (
                  <div className="relative overflow-hidden rounded-2xl border border-warm-200 shadow-sm">
                    <Image src={`data:image/jpeg;base64,${img}`} alt={slot} width={180} height={180} unoptimized className="aspect-square w-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-warm-900/80 text-xs text-white">×</button>
                    <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-warm-600">{slot}</span>
                  </div>
                ) : (
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-warm-200 bg-warm-50 transition-all hover:border-accent hover:bg-accent/5">
                    <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                    <div className="text-center">
                      <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-lg text-accent shadow-sm">+</div>
                      <p className="mt-2 text-sm font-medium text-warm-600">{slot}</p>
                      <p className="mt-1 text-xs text-warm-400">点击上传</p>
                    </div>
                  </label>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-warm-400">图片分析需要配置 OpenAI Key；未配置时会跳过图片理解，但仍可生成文案。</p>
      </section>

      <section className="rounded-2xl border border-warm-200 bg-white p-5">
        <div className="mb-5">
          <h3 className="text-base font-bold text-warm-900">成本与定价</h3>
          <p className="mt-1 text-sm text-warm-500">填写后 AI 会给出目标市场定价建议。</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-warm-700">产品拿货价 ¥</label>
            <input ref={productCostRef} type="number" defaultValue="" placeholder="如：68" onChange={updatePrice}
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-warm-700">物流费用 ¥</label>
            <input ref={shippingCostRef} type="number" defaultValue="" placeholder="如：15" onChange={updatePrice}
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-300 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-warm-700">期望利润率 %</label>
            <input ref={profitMarginRef} type="number" defaultValue="40" onChange={updatePrice}
              className="mt-1.5 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
        {sellingPrice && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-xs font-medium text-emerald-600">粗略售价预估</span>
            <p className="mt-1 text-xl font-bold text-emerald-900">¥{sellingPrice}</p>
          </div>
        )}
      </section>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-dark py-4 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:from-accent-dark hover:to-accent-dark hover:shadow-xl hover:shadow-accent/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? "AI 正在分析产品…" : "下一步：AI 智能追问"}
      </button>
    </div>
  );
}
