import { join } from "path";
import { homedir } from "os";
import type { Store, Task } from "../types";

const DIR = join(homedir(), ".bw");

const FILE = join(DIR, "data.json");

const DEFAULT: Store = { history: [], goals: { dailyHours: 4 } };

export async function readStore(): Promise<Store> {
  try {
    const f = Bun.file(FILE);
    if (!(await f.exists())) return structuredClone(DEFAULT);
    //если файла нет , то создается новый клон , но со значениями default
    return await f.json(); // и возращается по дефолту:
/*{
  "history": [],
  "goals": {
    "dailyHours": 4
  }
}*/
  } catch {
    return structuredClone(DEFAULT);
  }
}

export async function writeStore(store: Store): Promise<void> {
  await Bun.write(
    FILE,
    JSON.stringify(store, null, 2) // преобразование обьекта js  в json
  );
}

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  // создание id задачи "mq7uyxw5w3cn" например такой id
}

export function taskDuration(task: Task, now = Date.now()): number {
  const end = task.stoppedAt ?? now;
  const paused = task.pausedMs + (task.pausedAt ? now - task.pausedAt : 0);
  return end - task.startedAt - paused;
  //счиатает длительность задачи 
  
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function msToHours(ms: number): number {
  return ms / 1000 / 3600;
}
