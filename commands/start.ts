import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

import { readStore, writeStore, makeId } from "../lib/store";
import { c, colorTag } from "../lib/format";
import type { Task } from "../types";

const TAGS = ["работа", "личное", "учеба", "другое"];

export async function cmdStart(args: string[]) {
  const store = await readStore();

  if (store.active) {
    store.active.stoppedAt = Date.now();
    store.history.push(store.active);

    console.log(
      `${c.yellow}⏹  Stopped: ${store.active.name}${c.reset}`
    );
  }

  const rl = createInterface({
    input,
    output,
  });

  try {
    let name = args
      .filter(a => !a.startsWith("--"))
      .join(" ")
      .trim();

    const tagArg = args.find(a => a.startsWith("--tag="))?.split("=")[1];
    const estArg = args.find(a => a.startsWith("--est="))?.split("=")[1];

    if (!name) {
      name = (
        await rl.question(
          `${c.cyan}? Task name: ${c.reset}`
        )
      ).trim();

      if (!name) {
        console.log(`${c.red}Aborted.${c.reset}`);
        process.exit(1);
      }
    }

    let tag = tagArg ?? "";

    if (!tag) {
      const tagList = TAGS.map(
        (t, i) => `${c.dim}${i + 1}${c.reset} ${t}`
      ).join("  ");

      const input = (
        await rl.question(
          `${c.cyan}? Tag ${c.dim}[${tagList}${c.dim}] (number or name): ${c.reset}`
        )
      ).trim();

      const idx = Number(input) - 1;

      tag =
        TAGS[idx] ??
        (TAGS.includes(input) ? input : "другое");
    }

    let est: number | undefined;

    if (estArg) {
      est = parseInt(estArg);
    } else {
      const input = (
        await rl.question(
          `${c.cyan}? Estimated minutes ${c.dim}(optional): ${c.reset}`
        )
      ).trim();

      if (input) {
        est = parseInt(input);
      }
    }

    const task: Task = {
      id: makeId(),
      name,
      tag,
      startedAt: Date.now(),
      pausedMs: 0,
      estimatedMin: est,
    };

    store.active = task;

    await writeStore(store);

    console.log(
      `\n${c.green}▶ Started${c.reset} ${c.bold}${name}${c.reset} ${colorTag(tag)}` +
      (est
        ? ` ${c.dim}est. ${est}m${c.reset}`
        : "")
    );

    console.log(
      `${c.gray}run ${c.reset}${c.cyan}bun cw${c.reset}${c.gray} to see live timer${c.reset}\n`
    );
  } finally {
    rl.close();
  }
}