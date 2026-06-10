import { c } from "./format";
import { readStore } from "./store";

export async function getActiveTask() {
  const store = await readStore();

  if (!store.active) {
    console.log(`${c.yellow}Нет активных задач.${c.reset}`);
    return null;
  }

  return { store, task: store.active };
}