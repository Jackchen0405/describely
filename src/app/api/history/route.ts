import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getHistoryForUser } from "@/lib/history-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  return NextResponse.json({
    entries: getHistoryForUser(user.id),
  });
}
