import { readStore, taskDuration, formatDuration } from "../lib/store";
import { c, colorTag, bar, pad2 } from "../lib/format";
import type { Task } from "../types";

// ─── Terminal escape helpers ───────────────────────────────────────────────
const ESC = {
  altEnter:    "\x1b[?1049h",  // switch to alternate screen buffer
  altExit:     "\x1b[?1049l",  // restore original screen + history
  hideCursor:  "\x1b[?25l",
  showCursor:  "\x1b[?25h",
  home:        "\x1b[H",       // move cursor to 0,0
  clearScreen: "\x1b[2J",
  clearEOL:    "\x1b[K",       // clear from cursor to end of line
  moveTo: (row: number, col = 1) => `\x1b[${row};${col}H`,
};

// ─── Terminal size ─────────────────────────────────────────────────────────
function termWidth() {
  return process.stdout.columns ?? 80;
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function addSpace(lines: string[], count = 1) {
  lines.push(...Array(count).fill(""));
}

/* -------------------------------------------------- */
/* Sections */
/* -------------------------------------------------- */

function renderHeader(lines: string[]) {
  const now = new Date();

  const time =
    `${pad2(now.getHours())}:` +
    `${pad2(now.getMinutes())}:` +
    `${pad2(now.getSeconds())}`;

  const date = now.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  lines.push(
    `  ${c.bold}${c.yellow}${time}${c.reset} ${c.dim}${date}${c.reset}`
  );
}

function renderActiveTask(lines: string[], active: any) {
  if (!active) {
    lines.push(`  ${c.dim}Нет активной задачи${c.reset}`);
    lines.push(
      `  ${c.gray}Запуск:${c.reset} ${c.cyan}bun cw start${c.reset}`
    );
    return;
  }

  const duration = taskDuration(active);
  const paused = !!active.pausedAt;

  const icon = paused
    ? `${c.yellow}⏸`
    : `${c.green}▶`;

  lines.push(
    `  ${icon}${c.reset} ${c.bold}${active.name}${c.reset} ${colorTag(active.tag)}`
  );

  let row =
    `  ${c.gray}Время:${c.reset} ` +
    `${c.green}${formatDuration(duration)}${c.reset}`;

  if (active.estimatedMin) {
    const progress =
      duration / (active.estimatedMin * 60000);

    row +=
      ` ${bar(progress, 12)}` +
      ` ${Math.round(progress * 100)}%`;
  }

  lines.push(row);
}

function renderToday(lines: string[], store: any, width: number) {
  const dayStart = startOfDay();

  const tasks = [
    ...store.history.filter((t:Task) => t.startedAt >= dayStart),
    ...(store.active?.startedAt >= dayStart
      ? [store.active]
      : []),
  ];

  const totalMs = tasks.reduce(
    (sum, task) => sum + taskDuration(task),
    0
  );

  const goalMs =
    store.goals.dailyHours * 3600000;

  const ratio = totalMs / goalMs;

  const barWidth = Math.max(
    10,
    Math.min(30, width - 50)
  );

  lines.push(
    `  ${c.gray}Сегодня${c.reset}`
  );

  lines.push(
    `  ${bar(ratio, barWidth)} ` +
    `${c.bold}${formatDuration(totalMs)}${c.reset}` +
    `${c.dim}/${store.goals.dailyHours}h${c.reset}`
  );
}

function renderRecent(lines: string[], store: any) {
  const recent =
    store.history
      .slice(-3)
      .reverse();

  if (!recent.length) return;

  lines.push("");
  lines.push(`  ${c.dim}Последние задачи${c.reset}`);

  for (const task of recent) {
    lines.push(
      `  • ${task.name.slice(0, 24).padEnd(24)}` +
      ` ${colorTag(task.tag)}` +
      ` ${c.dim}${formatDuration(taskDuration(task))}${c.reset}`
    );
  }
}

function renderFooter(lines: string[]) {
  lines.push("");
  lines.push(
    `  ${c.dim}${"─".repeat(40)}${c.reset}`
  );

  lines.push(
    `  ${c.dim}[s] stop  [p] pause  [q] quit${c.reset}`
  );
}

/* -------------------------------------------------- */
/* Frame */
/* -------------------------------------------------- */

async function buildFrame() {
  const store = await readStore();
  const width = termWidth();

  const lines: string[] = [];

  renderHeader(lines);

  addSpace(lines);

  renderActiveTask(lines, store.active);

  addSpace(lines);

  renderToday(lines, store, width);

  renderRecent(lines, store);

  renderFooter(lines);

  return lines;
}

let lastLineCount = 0;

async function render(cols: number): Promise<void> {
  const frame = await buildFrame();

  let out = ESC.home;
  for (const line of frame) {
    out += line + ESC.clearEOL + "\n";
  }
  // blank any leftover lines from a taller previous frame
  for (let i = frame.length; i < lastLineCount; i++) {
    out += ESC.clearEOL + "\n";
  }

  process.stdout.write(out);
  lastLineCount = frame.length;
}

// ─── Keyboard (raw mode) ──────────────────────────────────────────────────
function setupKeyboard(stop: () => void): void {
  if (!process.stdin.isTTY) return;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", async (key: string) => {
    if (key === "q" || key === "\x03" || key === "\x1b") {
      stop();
    } else if (key === "s") {
      const { cmdStop } = await import("./stop");
      await cmdStop();
    } else if (key === "p") {
      const store = await readStore();
      if (store.active?.pausedAt) {
        const { cmdResume } = await import("./stop");
        await cmdResume();
      } else {
        const { cmdPause } = await import("./stop");
        await cmdPause();
      }
    }
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────
export async function cmdClock(): Promise<void> {
  const cols = termWidth();

  // Enter alternate buffer — original terminal state preserved untouched
  process.stdout.write(ESC.altEnter + ESC.hideCursor + ESC.clearScreen);

  let running = true;
  let ticker: ReturnType<typeof setInterval>;

  const exit = () => {
    running = false;
    clearInterval(ticker);
    process.stdout.write(ESC.showCursor + ESC.altExit);
    process.exit(0);
  };

  setupKeyboard(exit);
  process.on("SIGINT", exit);
  process.on("SIGTERM", exit);

  // Redraw on resize
  process.stdout.on("resize", () => render(process.stdout.columns ?? 80));

  await render(cols);
  ticker = setInterval(() => render(process.stdout.columns ?? 80), 1000);

  await new Promise<void>(resolve => {
    const check = setInterval(() => {
      if (!running) { clearInterval(check); resolve(); }
    }, 100);
  });
}
