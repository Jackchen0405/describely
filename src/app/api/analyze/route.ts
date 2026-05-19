import { NextRequest, NextResponse } from "next/server";
import { analyzeProductImage, generateFollowUpQuestions } from "@/lib/ai";
import { ProductBasicInput } from "@/types";
import { MARKETS } from "@/lib/markets";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body as ProductBasicInput;

    if (!input.name || !input.category) {
      return NextResponse.json({ error: "请填写产品名和品类" }, { status: 400 });
    }

    if (!input.targetMarket || !MARKETS[input.targetMarket]) {
      return NextResponse.json({ error: "请选择有效的目标市场" }, { status: 400 });
    }

    const market = MARKETS[input.targetMarket];

    let imageAnalysis = null;
    if (input.imageBase64s && input.imageBase64s.length > 0) {
      imageAnalysis = await analyzeProductImage(input.imageBase64s, input.name, market);
    }

    const { questions, usage } = await generateFollowUpQuestions(input, imageAnalysis);

    return NextResponse.json({
      questions,
      usage,
      imageAnalysis,
      hasVision: imageAnalysis !== null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "分析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
