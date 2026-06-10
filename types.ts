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
