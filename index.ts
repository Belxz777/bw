#!/usr/bin/env bun
import { cmdStart } from "./commands/start";
import { cmdStop, cmdPause, cmdResume, cmdStatus } from "./commands/stop";
import { cmdLog } from "./commands/log";
import { cmdReport } from "./commands/report";
import { cmdClock } from "./commands/clock";
import { cmdAdd, cmdGoal, cmdExport } from "./commands/misc";
import { c } from "./lib/format";
import { cmdConfig } from "./config";
import { cmdTag } from "./commands/tags";

const [,, cmd = "", ...args] = process.argv;

const HELP = `
${c.bold}${c.cyan}bw${c.reset} — terminal time tracker (made by belx777)

${c.bold}Помощь:${c.reset}
  ${c.green}bun bw${c.reset}                     живое время + активная задача
  ${c.green}bun bw new${c.reset} [name]          создать новую задачу
  ${c.green}bun bw stop${c.reset}                остановить текущую задачу
  ${c.green}bun bw pause${c.reset}               приостановить время на задаче
  ${c.green}bun bw resume${c.reset}              запустить время вновь
  ${c.green}bun bw status${c.reset}              посмотреть активную задачу

  ${c.green}bun bw log${c.reset}                 журнал задач на сегодня
  ${c.green}bun bw log --week${c.reset}          недельный журнал
  ${c.green}bun bw report${c.reset}              недельный отчет по задачам
  ${c.green}bun bw report --month${c.reset}      месячный отчет 

  ${c.green}bun bw add${c.reset} "имя" [opts]   добавить задачу вручную
    ${c.dim}--tag=work  --dur=45  --at=09:00${c.reset}

  ${c.green}bun bw goal set 8h${c.reset}         дневная цель по работе
  ${c.green}bun bw export --csv${c.reset}        экспорт в csv(db)
  ${c.green}bun bw export --json${c.reset}       экспорт в json 
`;

switch (cmd) {
  case "":
  case "clock":   await cmdClock();            break;
  case "new":   await cmdStart(args);        break;
  case "stop":    await cmdStop();             break;
  case "pause":   await cmdPause();            break;
  case "resume":  await cmdResume();           break;
  case "status":  await cmdStatus();           break;
  //покрыто и провренно
  case "log":     await cmdLog(args);          break;
  case "report":  await cmdReport(args);       break;
  case "add":     await cmdAdd(args);          break;
  case "goal":    await cmdGoal(args);         break;
  case "export":  await cmdExport(args);       break;
  case "config": await cmdConfig(args);         break;
  case "tag": await cmdTag(args);         break;
  case "--help":
  case "help":
  case "-h":      console.log(HELP);           break;
  default:
    console.log(`${c.red}Unknown command: ${cmd}${c.reset}\nRun ${c.cyan}bun bw help${c.reset}`);
    process.exit(1);
}
