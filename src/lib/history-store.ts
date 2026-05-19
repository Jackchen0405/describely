import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GenerationHistoryEntry, ProductFullInput, GeneratedProduct, TokenUsage } from "@/types";

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

export function addHistoryEntry(userId: string, input: ProductFullInput, result: GeneratedProduct, usage: TokenUsage) {
  const entries = readAllHistory();
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
  entries.unshift(entry);
  writeAllHistory(entries.slice(0, 500));
  return entry;
}

export function getHistoryForUser(userId: string) {
  return readAllHistory().filter((entry) => entry.userId === userId);
}

export function getHistoryEntryForUser(userId: string, id: string) {
  return readAllHistory().find((entry) => entry.userId === userId && entry.id === id) || null;
}
