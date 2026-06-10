import { readStore, taskDuration, formatDuration } from "../lib/store";
import { c, colorTag, tagColor, bar, header } from "../lib/format";
//! написать комментарии
function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime() - daysAgo * 86400000;
}

export async function cmdReport(args: string[]) {
  const store = await readStore();

  const days = args.includes("--month") ? 30 : 7;
  const from = startOfDay(days - 1);

  const tasks = [
    ...store.history,
    ...(store.active ? [store.active] : []),
  ].filter(t => t.startedAt >= from);

  if (!tasks.length) {
    console.log(`${c.gray} Нет информации.${c.reset}`);
    return;
  }

  const totalMs = tasks.reduce(
    (sum, task) => sum + taskDuration(task),
    0
  );

  const byTag = new Map<string, number>();

  for (const task of tasks) {
    byTag.set(
      task.tag,
      (byTag.get(task.tag) ?? 0) + taskDuration(task)
    );
  }

  const topTask = tasks.reduce((a, b) =>
    taskDuration(a) > taskDuration(b) ? a : b
  );

  console.log(
    header(`Отчет · последние ${days} дн. `)
  );

  const sortedTags = [...byTag.entries()]
    .sort((a, b) => b[1] - a[1]);

  const maxTagMs = sortedTags[0]?.[1] ?? 0;

  if (maxTagMs === 0) {
    console.log(`${c.gray} Нет данных по тегам.${c.reset}`);
    return;
  }

  for (const [tag, ms] of sortedTags) {
    console.log(
      `  ${tagColor(tag)}${(`#${tag}`).padEnd(12)}${c.reset}` +
      ` ${bar(ms / maxTagMs, 20)}` +
      ` ${c.bold}${formatDuration(ms)}${c.reset}`
    );
  }

  const goalMs =
    store.goals.dailyHours *
    3600000 *
    (days === 30 ? 22 : 5);

  console.log();
  console.log(
    `  Всего: ${c.green}${formatDuration(totalMs)}${c.reset}`
  );

  console.log(
    `  Цель по времени: ${Math.round(totalMs / goalMs * 100)}%`
  );

  console.log(
    `  Самая долгая: ${c.bold}${topTask.name}${c.reset} ${colorTag(topTask.tag)}`
  );

  console.log(
    `  Среднее: ${c.cyan}${formatDuration(totalMs / days)}${c.reset}`
  );

  console.log();
}