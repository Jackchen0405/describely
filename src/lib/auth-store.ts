import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AuthUser } from "@/types";

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
  return email.split("@")[0] || "Describely 用户";
}

export function findUserById(id: string) {
  return readUsers().find((user) => user.id === id) || null;
}

export function consumeUserCredit(id: string) {
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return null;
  if (user.credits <= 0) return { user, ok: false };

  user.credits -= 1;
  user.lastLoginAt = new Date().toISOString();
  writeUsers(users);
  return { user, ok: true };
}

export function upsertEmailUser(email: string) {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  const now = new Date().toISOString();
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

export function upsertWechatDemoUser() {
  const users = readUsers();
  const now = new Date().toISOString();
  const demoId = "wechat_demo_user";
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
