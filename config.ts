// commands/config.ts

import { CONFIG_FILE, DEFAULT_CONFIG, readConfig, writeConfig } from "./lib/conf";

export async function cmdConfig(args: string[]) {
  const config = await readConfig();

  if (args[0] === "edit") {
    const editor = process.env.EDITOR ?? "nano";
    Bun.spawnSync([editor, CONFIG_FILE], { stdio: ["inherit", "inherit", "inherit"] });
    return;
  }

  if (args[0] === "set" && args[1] && args[2]) {
    const keys = args[1].split(".");        // "goals.dailyHours" → ["goals", "dailyHours"]
    let node: any = config;
    for (const k of keys.slice(0, -1)) {
      node = node[k];
      if (!node) { console.log(`Unknown key: ${args[1]}`); return; }
    }
    const lastKey = keys.at(-1)!;
    const raw = args[2];
    // автоматически определяем тип
    node[lastKey] = raw === "true" ? true
                  : raw === "false" ? false
                  : isNaN(Number(raw)) ? raw
                  : Number(raw);
    await writeConfig(config);
    console.log(`✓ ${args[1]} = ${node[lastKey]}`);
    return;
  }

  if (args[0] === "reset") {
    await writeConfig(DEFAULT_CONFIG);
    console.log("✓ Config reset to defaults");
    return;
  }

  // просто показать
  console.log(JSON.stringify(config, null, 2));
}