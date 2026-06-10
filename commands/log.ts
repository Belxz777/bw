import { readStore, taskDuration, formatDuration } from "../lib/store";
import { c, colorTag, formatDate, header } from "../lib/format";

function startOfDay(daysAgo = 0): number {
  const d = new Date();

  d.setHours(0, 0, 0, 0);

  return d.getTime() - daysAgo * 86400000;
}

function getPeriod(args: string[]) {
  if (args.includes("--all")) {
    return {
      from: 0,
      label: "все время",
    };
  }

  if (args.includes("--week")) {
    return {
      from: startOfDay(6),
      label: "эту неделю",
    };
  }

  return {
    from: startOfDay(),
    label: "сегодня",
  };
}

function formatEntry(task: any) {
  const duration = taskDuration(task);
  const active = !task.stoppedAt;

  const icon = active
    ? `${c.cyan}●`
    : `${c.white}·`;

  return (
    `  ${icon}${c.reset} ` +
    ` ${c.dim}${formatDate(task.startedAt)}${c.reset}` +
    ` ${c.bold}${task.name.padEnd(28)}${c.reset}` +
    ` ${colorTag(task.tag).padEnd(20)}` +
    ` ${c.green}${formatDuration(duration).padStart(8)}${c.reset}` +
    (active ? ` ${c.cyan}(active)${c.reset}` : "")
  );
}

export async function cmdLog(args: string[]) {
  const store = await readStore();

  const tasks = [
    ...store.history,
    ...(store.active ? [store.active] : []),
  ];

  if (!tasks.length) {
    console.log(`${c.white}Пока нет задач.${c.reset}`);
    return;
  }

  const period = getPeriod(args);

  const entries = tasks.filter(
    task => task.startedAt >= period.from
  );

  if (!entries.length) {
    console.log(
      `${c.white}За этот период задач неть.${c.reset}`
    );
    return;
  }

  console.log(
    header(`Журнал · за ${period.label}`)
  );

  let totalDuration = 0;

  for (const task of entries) {
    totalDuration += taskDuration(task);

    console.log(
      formatEntry(task)
    );
  }

  console.log();
  console.log(
    `  ${c.dim}${"─".repeat(62)}${c.reset}`
  );

  console.log(
    `  ${c.white}Всего:${c.reset} ` +
    `${c.bold}${c.green}${formatDuration(totalDuration)}${c.reset}` +
    ` ${c.dim}· ${entries.length} зап. ${c.reset}`
  );

  console.log();
}