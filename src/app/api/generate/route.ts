import { NextRequest, NextResponse } from "next/server";
import { generateProductContent } from "@/lib/ai";
import { ProductFullInput } from "@/types";
import { MARKETS } from "@/lib/markets";
import { PLATFORMS } from "@/lib/platforms";
import { currentUser } from "@/lib/session";
import { consumeUserCredit } from "@/lib/auth-store";
import { addHistoryEntry } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录后再生成文案" }, { status: 401 });
    }
    if (user.credits <= 0) {
      return NextResponse.json({ error: "试用额度已用完，请升级套餐或稍后再试" }, { status: 402 });
    }

    const body = await req.json();
    const input = body as ProductFullInput;

    if (!input.name || !input.category) {
      return NextResponse.json({ error: "请填写产品名和品类" }, { status: 400 });
    }

    if (!input.targetMarket || !MARKETS[input.targetMarket]) {
      return NextResponse.json({ error: "请选择有效的目标市场" }, { status: 400 });
    }
    if (!input.platform || !PLATFORMS[input.platform]) {
      input.platform = "amazon";
    }

    const { result, usage } = await generateProductContent(input, input.imageAnalysis);
    const creditResult = await consumeUserCredit(user.id);
    if (!creditResult?.ok) {
      return NextResponse.json({ error: "试用额度已用完，请升级套餐或稍后再试" }, { status: 402 });
    }
    const history = await addHistoryEntry(user.id, input, result, usage);

    return NextResponse.json({
      result,
      usage,
      market: MARKETS[input.targetMarket],
      user: creditResult.user,
      historyId: history.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
