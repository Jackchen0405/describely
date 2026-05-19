import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface FeedbackEntry {
  id: string;
  content: string;
  createdAt: string;
}

const FEEDBACK_FILE = path.join(process.cwd(), "data", "feedback.json");

function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFeedback(): FeedbackEntry[] {
  ensureDataDir();
  if (!fs.existsSync(FEEDBACK_FILE)) return [];
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFeedback(entries: FeedbackEntry[]) {
  ensureDataDir();
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function GET() {
  const entries = readFeedback();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "请输入反馈内容" }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: "反馈内容不能超过1000字" }, { status: 400 });
    }

    const entry: FeedbackEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const entries = readFeedback();
    entries.push(entry);
    writeFeedback(entries);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}
