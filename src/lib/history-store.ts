import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  CopywritingStyle,
  GenerationHistoryEntry,
  ProductFullInput,
  GeneratedProduct,
  PlatformId,
  TargetMarket,
  TokenUsage,
} from "@/types";
import { hasSupabaseConfig, insertRow, selectOne, selectRows } from "@/lib/supabase-rest";

const HISTORY_FILE = path.join(process.cwd(), "data", "history.json");

interface StoredHistory {
  entries: GenerationHistoryEntry[];
}

function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAllHistory(): GenerationHistoryEntry[] {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredHistory | GenerationHistoryEntry[];
    return Array.isArray(parsed) ? parsed : parsed.entries || [];
  } catch {
    return [];
  }
}

function writeAllHistory(entries: GenerationHistoryEntry[]) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ entries }, null, 2), "utf-8");
}

interface SupabaseHistoryRow {
  id: string;
  user_id: string;
  product_name: string;
  category: string;
  target_market: string;
  platform: string;
  copywriting_style?: string | null;
  result: GeneratedProduct;
  usage: TokenUsage;
  created_at: string;
}

function fromSupabaseHistory(row: SupabaseHistoryRow): GenerationHistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    productName: row.product_name,
    category: row.category,
    targetMarket: row.target_market as TargetMarket,
    platform: row.platform as PlatformId,
    copywritingStyle: (row.copywriting_style || undefined) as CopywritingStyle | undefined,
    result: row.result,
    usage: row.usage,
    createdAt: row.created_at,
  };
}

export async function addHistoryEntry(userId: string, input: ProductFullInput, result: GeneratedProduct, usage: TokenUsage) {
  const entry: GenerationHistoryEntry = {
    id: `gen_${crypto.randomUUID()}`,
    userId,
    productName: input.name,
    category: input.category,
    targetMarket: input.targetMarket,
    platform: input.platform,
    copywritingStyle: input.copywritingStyle,
    result,
    usage,
    createdAt: new Date().toISOString(),
  };

  if (hasSupabaseConfig()) {
    const row = await insertRow<SupabaseHistoryRow>("generation_history", {
      id: entry.id,
      user_id: entry.userId,
      product_name: entry.productName,
      category: entry.category,
      target_market: entry.targetMarket,
      platform: entry.platform,
      copywriting_style: entry.copywritingStyle || null,
      result: entry.result,
      usage: entry.usage,
      created_at: entry.createdAt,
    });
    return row ? fromSupabaseHistory(row) : entry;
  }

  const entries = readAllHistory();
  entries.unshift(entry);
  writeAllHistory(entries.slice(0, 500));
  return entry;
}

export async function getHistoryForUser(userId: string) {
  if (hasSupabaseConfig()) {
    const rows = await selectRows<SupabaseHistoryRow>(
      "generation_history",
      `user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`
    );
    return rows.map(fromSupabaseHistory);
  }
  return readAllHistory().filter((entry) => entry.userId === userId);
}

export async function getHistoryEntryForUser(userId: string, id: string) {
  if (hasSupabaseConfig()) {
    const row = await selectOne<SupabaseHistoryRow>(
      "generation_history",
      `user_id=eq.${encodeURIComponent(userId)}&id=eq.${encodeURIComponent(id)}`
    );
    return row ? fromSupabaseHistory(row) : null;
  }
  return readAllHistory().find((entry) => entry.userId === userId && entry.id === id) || null;
}
