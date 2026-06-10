import {
  readStore,
  writeStore,
  formatDuration,
  taskDuration,
} from "../lib/store";

import { c, colorTag } from "../lib/format";
import { getActiveTask } from "../lib/helper";
//& ЗДЕСЬ Ф-ЦИИ ДЛЯ ОСТАНОВКИ | ПАУЗЫ | СТАТУСА задач
export async function cmdStop() {
  const active = await getActiveTask();

  if (!active) return;

  const { store, task } = active;

  task.stoppedAt = Date.now();

  store.history.push(task);
  store.active = undefined;

  await writeStore(store);

  console.log(`
${c.red}⏹ Задача остановлена: ${c.reset} ${c.bold}${task.name}${c.reset} ${colorTag(task.tag)}
${c.gray} Длительность:${c.reset} ${c.green}${formatDuration(taskDuration(task))}${c.reset}
`);
}

export async function cmdPause() {
  const active = await getActiveTask();

  if (!active) return;

  const { store, task } = active

  if (task.pausedAt)
    return console.log(`${c.yellow}Уже ждет.${c.reset}`);

  task.pausedAt = Date.now();

  await writeStore(store);

  console.log(`${c.yellow}⏸ Задача по имени ${c.magenta}${task.name}${c.reset} ${c.yellow}ждёт и кайфует ${c.reset} `);
}

export async function cmdResume() {
 const active = await getActiveTask();

  if (!active) return;

  const { store, task } = active

  if (!task.pausedAt)
    return console.log(`${c.yellow}И так запущена!${c.reset}`);

  task.pausedMs += Date.now() - task.pausedAt;
  task.pausedAt = undefined;

  await writeStore(store);

  console.log(`${c.green}▶ Задача ${task.name}  ожила ${c.reset}`);
}

export async function cmdStatus() {
  const active = await getActiveTask();

  if (!active) return;

  const { store, task } = active
  
  const paused = !!task.pausedAt;

  console.log(`
${paused ? `${c.yellow}⏸` : `${c.green}▶`} ${c.bold}${task.name}${c.reset} ${colorTag(task.tag)}
${c.white}Прошло:${c.reset} ${c.green}${formatDuration(taskDuration(task))}${c.reset}${
    task.estimatedMin
      ? ` ${c.white}/ ${task.estimatedMin}m${c.reset}`
      : ""
  }
`);
}
