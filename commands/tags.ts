// commands/tag.ts

import { readConfig, writeConfig } from "../lib/conf";
import { ANSI, c } from "../lib/format";
import type { TagConfig } from "../types";

export async function cmdTag(args: string[]) {
  const config = await readConfig();

  if (args[0] === "add" && args[1]) {
    const name   = args[1];
    const color  = (args.find(a => a.startsWith("--color="))?.split("=")[1] ?? "gray") as TagConfig["color"];
    const icon   = args.find(a => a.startsWith("--icon="))?.split("=")[1] ?? "·";
    config.tags[name] = { color, icon };
    await writeConfig(config);
    console.log(`✓ Tag #${name} added ■${c.reset}  ${icon}`);
    return;
  }

  if (args[0] === "remove" && args[1]) {
    const builtIn = ["work", "personal", "study", "health", "other"];
    if (builtIn.includes(args[1])) { console.log("Cannot remove built-in tag"); return; }
    delete config.tags[args[1]];
    await writeConfig(config);
    console.log(`✓ Tag #${args[1]} removed`);
    return;
  }

  // list
  for (const [name, t] of Object.entries(config.tags)) {
    console.log(`  ${ANSI[t.color]} ■${c.reset}  #${name.padEnd(12)}  ${t.icon}`);
  }
}//ansi какой то