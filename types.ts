// types.ts — добавить

export interface TagConfig {
  color: "red" | "green" | "yellow" | "blue" | "cyan" | "magenta" | "gray";
  icon?: string;  // emoji или ascii: "💻" / "@"
}

export interface Config {
  goals: {
    dailyHours: number;
    weeklyHours: number;
  };
  tags: Record<string, TagConfig>;  // ключ — имя тега
  clock: {
    refreshMs: number;     // интервал обновления, дефолт 1000
    dateLocale: string;    // "ru-RU" / "en-US"
    timeFormat: "24h" | "12h";
  };
  display: {
    barWidth: number;      // ширина прогресс-бара
    recentCount: number;   // сколько последних задач показывать
  };
}

export interface Task {
  id: string;
  name: string;
  tag: string;
  startedAt: number;     // unix ms
  stoppedAt?: number;
  pausedAt?: number;
  pausedMs: number;      // total paused duration
  estimatedMin?: number;
}

export interface Store {
  active?: Task;
  history: Task[];
  goals: { dailyHours: number };
}
