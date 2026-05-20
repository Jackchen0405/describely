import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AuthUser } from "@/types";
import { deleteRows, hasSupabaseConfig, insertRow, patchRows, selectOne, upsertRow } from "@/lib/supabase-rest";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

interface StoredUsers {
  users: AuthUser[];
}

function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readUsers(): AuthUser[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredUsers | AuthUser[];
    return Array.isArray(parsed) ? parsed : parsed.users || [];
  } catch {
    return [];
  }
}

function writeUsers(users: AuthUser[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), "utf-8");
}

function userNameFromEmail(email: string) {
  return email.split("@")[0] || "buluba 用户";
}

interface SupabaseUserRow {
  id: string;
  email?: string | null;
  name: string;
  avatar?: string | null;
  provider: "email" | "wechat";
  credits: number;
  created_at: string;
  last_login_at: string;
}

interface VerificationCodeRow {
  email: string;
  code: string;
  expires_at: string;
}

interface CreditLogRow {
  id: number;
  user_id: string;
  change: number;
  reason: string;
  order_id?: string | null;
  history_id?: string | null;
  balance_after?: number | null;
  created_at: string;
}

function fromSupabaseUser(row: SupabaseUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email || undefined,
    name: row.name,
    avatar: row.avatar || undefined,
    provider: row.provider,
    credits: row.credits,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function toSupabaseUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email || null,
    name: user.name,
    avatar: user.avatar || null,
    provider: user.provider,
    credits: user.credits,
    created_at: user.createdAt,
    last_login_at: user.lastLoginAt,
  };
}

export async function findUserById(id: string) {
  if (hasSupabaseConfig()) {
    const row = await selectOne<SupabaseUserRow>("app_users", `id=eq.${encodeURIComponent(id)}`);
    return row ? fromSupabaseUser(row) : null;
  }
  return readUsers().find((user) => user.id === id) || null;
}

export async function consumeUserCredit(id: string) {
  if (hasSupabaseConfig()) {
    const user = await findUserById(id);
    if (!user) return null;
    if (user.credits <= 0) return { user, ok: false };

    const now = new Date().toISOString();
    const nextCredits = user.credits - 1;
    const rows = await patchRows<SupabaseUserRow>(
      "app_users",
      `id=eq.${encodeURIComponent(id)}`,
      { credits: nextCredits, last_login_at: now }
    );
    await insertRow<CreditLogRow>("credit_logs", {
      user_id: id,
      change: -1,
      reason: "generate",
      balance_after: nextCredits,
      created_at: now,
    });
    const updated = rows[0] ? fromSupabaseUser(rows[0]) : { ...user, credits: nextCredits, lastLoginAt: now };
    return { user: updated, ok: true };
  }

  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return null;
  if (user.credits <= 0) return { user, ok: false };

  user.credits -= 1;
  user.lastLoginAt = new Date().toISOString();
  writeUsers(users);
  return { user, ok: true };
}

export async function addUserCredits(id: string, credits: number, reason: string, orderId?: string) {
  if (credits <= 0) throw new Error("credits must be positive");

  if (hasSupabaseConfig()) {
    const user = await findUserById(id);
    if (!user) return null;

    const now = new Date().toISOString();
    const nextCredits = user.credits + credits;
    const rows = await patchRows<SupabaseUserRow>(
      "app_users",
      `id=eq.${encodeURIComponent(id)}`,
      { credits: nextCredits, last_login_at: now }
    );
    await insertRow<CreditLogRow>("credit_logs", {
      user_id: id,
      change: credits,
      reason,
      order_id: orderId || null,
      balance_after: nextCredits,
      created_at: now,
    });
    return rows[0] ? fromSupabaseUser(rows[0]) : { ...user, credits: nextCredits, lastLoginAt: now };
  }

  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return null;
  user.credits += credits;
  user.lastLoginAt = new Date().toISOString();
  writeUsers(users);
  return user;
}

export async function upsertEmailUser(email: string) {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (hasSupabaseConfig()) {
    const existing = await selectOne<SupabaseUserRow>(
      "app_users",
      `email=eq.${encodeURIComponent(normalized)}`
    );
    if (existing) {
      const rows = await patchRows<SupabaseUserRow>(
        "app_users",
        `id=eq.${encodeURIComponent(existing.id)}`,
        { last_login_at: now }
      );
      return fromSupabaseUser(rows[0] || { ...existing, last_login_at: now });
    }

    const user: AuthUser = {
      id: `usr_${crypto.randomUUID()}`,
      email: normalized,
      name: userNameFromEmail(normalized),
      provider: "email",
      credits: 5,
      createdAt: now,
      lastLoginAt: now,
    };
    const row = await upsertRow<SupabaseUserRow>("app_users", toSupabaseUser(user), "email");
    return row ? fromSupabaseUser(row) : user;
  }

  const users = readUsers();
  const existing = users.find((user) => user.email?.toLowerCase() === normalized);

  if (existing) {
    existing.lastLoginAt = now;
    writeUsers(users);
    return existing;
  }

  const user: AuthUser = {
    id: `usr_${crypto.randomUUID()}`,
    email: normalized,
    name: userNameFromEmail(normalized),
    provider: "email",
    credits: 5,
    createdAt: now,
    lastLoginAt: now,
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export async function upsertWechatDemoUser() {
  const now = new Date().toISOString();
  const demoId = "wechat_demo_user";

  if (hasSupabaseConfig()) {
    const existing = await findUserById(demoId);
    if (existing) {
      const rows = await patchRows<SupabaseUserRow>(
        "app_users",
        `id=eq.${encodeURIComponent(demoId)}`,
        { last_login_at: now }
      );
      return rows[0] ? fromSupabaseUser(rows[0]) : { ...existing, lastLoginAt: now };
    }

    const user: AuthUser = {
      id: demoId,
      name: "微信用户",
      avatar: "微信",
      provider: "wechat",
      credits: 10,
      createdAt: now,
      lastLoginAt: now,
    };
    const row = await upsertRow<SupabaseUserRow>("app_users", toSupabaseUser(user), "id");
    return row ? fromSupabaseUser(row) : user;
  }

  const users = readUsers();
  const existing = users.find((user) => user.id === demoId);

  if (existing) {
    existing.lastLoginAt = now;
    writeUsers(users);
    return existing;
  }

  const user: AuthUser = {
    id: demoId,
    name: "微信用户",
    avatar: "微信",
    provider: "wechat",
    credits: 10,
    createdAt: now,
    lastLoginAt: now,
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export async function storeVerificationCode(email: string, code: string, expiresAt: number) {
  const normalized = email.trim().toLowerCase();
  if (!hasSupabaseConfig()) return false;
  try {
    await upsertRow<VerificationCodeRow>(
      "verification_codes",
      {
        email: normalized,
        code,
        expires_at: new Date(expiresAt).toISOString(),
        created_at: new Date().toISOString(),
      },
      "email"
    );
    return true;
  } catch {
    return false;
  }
}

export async function getVerificationCode(email: string) {
  if (!hasSupabaseConfig()) return null;
  const normalized = email.trim().toLowerCase();
  try {
    const row = await selectOne<VerificationCodeRow>(
      "verification_codes",
      `email=eq.${encodeURIComponent(normalized)}`
    );
    if (!row) return null;
    return {
      code: row.code,
      expiresAt: new Date(row.expires_at).getTime(),
    };
  } catch {
    return null;
  }
}

export async function deleteVerificationCode(email: string) {
  if (!hasSupabaseConfig()) return false;
  try {
    await deleteRows("verification_codes", `email=eq.${encodeURIComponent(email.trim().toLowerCase())}`);
    return true;
  } catch {
    return false;
  }
}
