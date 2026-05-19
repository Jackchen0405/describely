import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getHistoryEntryForUser, getHistoryForUser } from "@/lib/history-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const entry = getHistoryEntryForUser(user.id, id);
    if (!entry) {
      return NextResponse.json({ error: "没有找到这条历史记录" }, { status: 404 });
    }
    return NextResponse.json({ entry });
  }

  return NextResponse.json({
    entries: getHistoryForUser(user.id),
  });
}
