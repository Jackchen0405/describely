"use client";

import { useCallback, useRef, useState } from "react";
import { TargetMarket } from "@/types";
import { MARKET_OPTIONS } from "@/lib/markets";

interface Props {
  onSubmit: (data: {
    name: string;
    category: string;
    targetMarket: TargetMarket;
    productCost?: number;
    shippingCost?: number;
    profitMargin?: number;
    imageBase64?: string;
  }) => void;
  loading: boolean;
}

export default function ProductForm({ onSubmit, loading }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [market, setMarket] = useState<TargetMarket>("US");
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

  const handleImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("图片不能超过 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

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
      productCost: pcVal ? parseFloat(pcVal) : undefined,
      shippingCost: scVal ? parseFloat(scVal) : undefined,
      profitMargin: pmVal ? parseFloat(pmVal) : undefined,
      imageBase64: image || undefined,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">上传产品，一键生成全套文案</h2>
        <p className="mt-1 text-sm text-zinc-500">填写基本信息后，AI 会追问关键细节，再为你生成目标市场的精准文案。</p>
      </div>

      {/* 目标市场 */}
      <div>
        <label className="text-sm font-medium text-zinc-700">目标市场 <span className="text-red-400">*</span></label>
        <p className="text-xs text-zinc-400 mb-2">影响输出语言、币种和SEO策略</p>
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value as TargetMarket)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none bg-white"
        >
          {MARKET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 产品图片 */}
      <div>
        <label className="text-sm font-medium text-zinc-700">产品图片（可选）</label>
        <p className="text-xs text-zinc-400 mb-2">AI 会分析图片，帮助生成更精准的追问和文案。</p>
        {image ? (
          <div className="relative inline-block">
            <img src={`data:image/jpeg;base64,${image}`} alt="预览" className="w-40 h-40 object-cover rounded-lg border border-zinc-200" />
            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 text-white text-xs flex items-center justify-center hover:bg-zinc-700">×</button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-40 h-40 rounded-lg border-2 border-dashed border-zinc-200 hover:border-zinc-400 cursor-pointer transition-colors">
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            <div className="text-center text-zinc-400">
              <div className="text-2xl">📷</div>
              <div className="text-xs mt-1">点击上传</div>
            </div>
          </label>
        )}
      </div>

      {/* 产品基础信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium text-zinc-700">产品名 <span className="text-red-400">*</span></label>
          <input ref={nameRef} defaultValue="" placeholder="如：中国手工石制茶宠摆件·钟馗"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">品类 <span className="text-red-400">*</span></label>
          <input ref={categoryRef} defaultValue="" placeholder="如：茶宠摆件"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">产品拿货价 ¥</label>
          <input ref={productCostRef} type="number" defaultValue="" placeholder="如：68" onChange={updatePrice}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">物流费用 ¥</label>
          <input ref={shippingCostRef} type="number" defaultValue="" placeholder="如：15" onChange={updatePrice}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">期望利润率 %</label>
          <div className="relative mt-1">
            <input ref={profitMarginRef} type="number" defaultValue="40" onChange={updatePrice}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 focus:border-zinc-400 focus:outline-none" />
            {sellingPrice && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">建议售价 ¥{sellingPrice}</span>
            )}
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        {loading ? "AI 正在分析产品…" : "下一步：AI 智能追问"}
      </button>
    </div>
  );
}
