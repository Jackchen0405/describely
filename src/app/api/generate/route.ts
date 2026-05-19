import { NextRequest, NextResponse } from "next/server";
import { generateProductContent } from "@/lib/ai";
import { ProductFullInput } from "@/types";
import { MARKETS } from "@/lib/markets";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body as ProductFullInput;

    if (!input.name || !input.category) {
      return NextResponse.json({ error: "请填写产品名和品类" }, { status: 400 });
    }

    if (!input.targetMarket || !MARKETS[input.targetMarket]) {
      return NextResponse.json({ error: "请选择有效的目标市场" }, { status: 400 });
    }

    const { result, usage } = await generateProductContent(input, input.imageAnalysis);

    return NextResponse.json({
      result,
      usage,
      market: MARKETS[input.targetMarket],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
