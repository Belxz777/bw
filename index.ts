#!/usr/bin/env bun
import { cmdStart } from "./commands/start";
import { cmdStop, cmdPause, cmdResume, cmdStatus } from "./commands/stop";
import { cmdLog } from "./commands/log";
import { cmdReport } from "./commands/report";
import { cmdClock } from "./commands/clock";
import { cmdAdd, cmdGoal, cmdExport } from "./commands/misc";
import { c } from "./lib/format";

const [,, cmd = "", ...args] = process.argv;

const HELP = `
${c.bold}${c.cyan}clockwork${c.reset} — terminal time tracker

${c.bold}Usage:${c.reset}
  ${c.green}bun cw${c.reset}                     live clock + active task
  ${c.green}bun cw new${c.reset} [name]        start a new task timer
  ${c.green}bun cw stop${c.reset}                stop current task
  ${c.green}bun cw pause${c.reset}               pause current task
  ${c.green}bun cw resume${c.reset}              resume paused task
  ${c.green}bun cw status${c.reset}              show active task

  ${c.green}bun cw log${c.reset}                 today's log
  ${c.green}bun cw log --week${c.reset}          this week's log
  ${c.green}bun cw report${c.reset}              weekly report with tag breakdown
  ${c.green}bun cw report --month${c.reset}      monthly report

  ${c.green}bun cw add${c.reset} "name" [opts]   add manual entry
    ${c.dim}--tag=work  --dur=45  --at=09:00${c.reset}

  ${c.green}bun cw goal set 8h${c.reset}         set daily hour goal
  ${c.green}bun cw export --csv${c.reset}        export to CSV
  ${c.green}bun cw export --json${c.reset}       export to JSON
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
  case "--help":
  case "help":
  case "-h":      console.log(HELP);           break;
  default:
    console.log(`${c.red}Unknown command: ${cmd}${c.reset}\nRun ${c.cyan}bun cw help${c.reset}`);
    process.exit(1);
}
