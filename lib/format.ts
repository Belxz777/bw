// ANSI colors
export const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  blue:   "\x1b[34m",
  cyan:   "\x1b[36m",
  white:  "\x1b[37m",
  gray:   "\x1b[90m",
  red:    "\x1b[31m",
  magenta:"\x1b[35m",
};
export const ANSI: Record<string, string> = {
  red:     c.red,
  green:   c.green,
  yellow:  c.yellow,
  blue:    c.blue,
  magenta: c.magenta,
  cyan:    c.cyan,
  gray:    c.gray,
  white:   c.white,
};
export const TAG_COLORS: Record<string, string> = {
  work:     c.blue,
  personal: c.magenta,
  study:    c.cyan,
  health:   c.green,
  other:    c.gray,
};

export function tagColor(tag: string): string {
  return TAG_COLORS[tag] ?? c.gray;
}

export function colorTag(tag: string): string {
  return `${tagColor(tag)}#${tag}${c.reset}`;
}

export function bar(ratio: number, width = 20): string {
  const filled = Math.round(Math.min(ratio, 1) * width);
  const empty = width - filled;
  const filledChar = "█";
  const emptyChar = "░";
  const color = ratio >= 1 ? c.green : ratio > 0.5 ? c.yellow : c.blue;
  return `${color}${filledChar.repeat(filled)}${c.dim}${emptyChar.repeat(empty)}${c.reset}`;
}

export function header(text: string): string {
  return `\n${c.bold}${c.white}${text}${c.reset}\n${c.dim}${"─".repeat(text.length)}${c.reset}`;
}

export function row(label: string, value: string, labelW = 12): string {
  return `  ${c.gray}${label.padEnd(labelW)}${c.reset}${value}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)} ${formatTime(d)}`;
}
