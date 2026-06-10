import {
  readStore,
  writeStore,
  makeId,
  formatDuration,
  taskDuration,
} from "../lib/store";

import { c, colorTag } from "../lib/format";

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

// Получить значение аргумента:
// --tag=work -> work
function getArg(args: string[], name: string) {
  return args
    .find(arg => arg.startsWith(`--${name}=`))
    ?.split("=")[1];
}

// Форматирование даты для CSV
function formatCsvDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Форматирование времени для CSV
function formatCsvTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/* -------------------------------------------------- */
/* Добавить завершённую задачу вручную
 *
 * bun cw add "Meeting"
 * bun cw add "Meeting" --tag=work
 * bun cw add "Meeting" --dur=45
 * bun cw add "Meeting" --at=09:00
 */
/* -------------------------------------------------- */

export async function cmdAdd(args: string[]) {
  const store = await readStore();

  const name = args
    .filter(arg => !arg.startsWith("--"))
    .join(" ")
    .trim();

  if (!name) {
    console.log(
      `${c.red}Usage: bun cw add "Task name" --tag=work --dur=45${c.reset}`
    );
    return;
  }

  const tag = getArg(args, "tag") ?? "other";

  const durationMin = Number(
    getArg(args, "dur") ?? 30
  );

  let startedAt =
    Date.now() - durationMin * 60000;

  // Если указано время начала:
  // --at=09:30
  const at = getArg(args, "at");

  if (at) {
    const [hours, minutes] = at.split(":").map(Number);
    const now = new Date();
  
  // Создаём новую дату с явными параметрами
    const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
  
  startedAt = date.getTime();
  }

  store.history.push({
    id: makeId(),
    name,
    tag,
    startedAt,
    stoppedAt:
      startedAt + durationMin * 60000,
    pausedMs: 0,
  });

  await writeStore(store);

  console.log(
    `${c.green}✓ Added${c.reset} ` +
    `${name} ` +
    `${colorTag(tag)} ` +
    `${c.green}${formatDuration(durationMin * 60000)}${c.reset}`
  );
}

/* -------------------------------------------------- */
/* Управление дневной целью
 *
 * bun cw goal
 * bun cw goal set 8h
 */
/* -------------------------------------------------- */

export async function cmdGoal(args: string[]) {
  const store = await readStore();

  // показать текущую цель
  if (args[0] !== "set") {
    console.log(
      `${c.gray}Daily goal:${c.reset} ` +
      `${c.bold}${store.goals.dailyHours}h${c.reset}`
    );
    return;
  }

  const value = args[1];

  if (!value) {
    console.log(
      `${c.red}Usage: bun cw goal set 8h${c.reset}`
    );
    return;
  }

  const hours = Number(
    value.replace("h", "")
  );

  if (isNaN(hours)) {
    console.log(
      `${c.red}Usage: bun cw goal set 8h${c.reset}`
    );
    return;
  }

  store.goals.dailyHours = hours;

  await writeStore(store);

  console.log(
    `${c.green}✓ Daily goal set to ${hours}h${c.reset}`
  );
}

/* -------------------------------------------------- */
/* Экспорт данных
 *
 * bun cw export --json
 * bun cw export --csv
 */
/* -------------------------------------------------- */

export async function cmdExport(args: string[]) {
  const store = await readStore();

  const tasks = [
    ...store.history,
    ...(store.active ? [store.active] : []),
  ];

  // JSON экспорт
  if (args.includes("--json")) {
    console.log(
      JSON.stringify(tasks, null, 2)
    );
    return;
  }

  // CSV экспорт
  const rows = [
    "id,name,tag,date,start,end,duration_min",
  ];

  for (const task of tasks) {
    const start = new Date(task.startedAt);

    const end = task.stoppedAt
      ? new Date(task.stoppedAt)
      : null;

    const durationMin = Math.round(
      taskDuration(task) / 60000
    );

    rows.push([
      task.id,
      `"${task.name}"`,
      task.tag,
      formatCsvDate(start),
      formatCsvTime(start),
      end ? formatCsvTime(end) : "",
      durationMin,
    ].join(","));
  }

  console.log(
    rows.join("\n")
  );
}