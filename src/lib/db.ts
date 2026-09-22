import fs from "fs";
import path from "path";
import type { Database } from "./types";

const dbPath = path.join(process.cwd(), "data", "db.json");

export function readDb(): Database {
  const raw = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + "\n", "utf-8");
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
