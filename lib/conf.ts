// lib/config.ts

import { join } from "path";
import { homedir } from "os";
import type { Config } from "../types";
// lib/config.ts

export const DEFAULT_CONFIG: Config = {
  goals: { dailyHours: 8, weeklyHours: 40 },
  tags: {
    работа:     { color: "blue",    icon: "💼" },
    учеба: { color: "magenta", icon: "" },
    чилл:    { color: "cyan",    icon: "" },
    другое:    { color: "gray",    icon: "·"  },
  },
  clock: {
    refreshMs: 1000,
    dateLocale: "ru-RU",
    timeFormat: "24h",
  },
  display: {
    barWidth: 20,
    recentCount: 3,
  },
};
export const CONFIG_FILE = join(homedir(), ".clockwork", "config.json");

function deepMerge<T>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key in overrides) {
    const val = overrides[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      result[key] = deepMerge(defaults[key] as any, val as any);
    } else if (val !== undefined) {
      result[key] = val as any;
    }
  }
  return result;
}

export async function readConfig(): Promise<Config> {
  try {
    const f = Bun.file(CONFIG_FILE);
    if (!(await f.exists())) return structuredClone(DEFAULT_CONFIG);
    const raw = await f.json();
    return deepMerge(DEFAULT_CONFIG, raw);   // пользователь переопределяет только то что хочет
  } catch {
    return structuredClone(DEFAULT_CONFIG);  // битый JSON — не крашимся
  }
}

export async function writeConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_FILE, JSON.stringify(config, null, 2));
}