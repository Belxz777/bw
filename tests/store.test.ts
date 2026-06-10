import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

// ── Подменяем путь ДО импорта store ───────────────────────────────────────
// store.ts читает CW_DATA_DIR при инициализации модуля,
// поэтому env нужно выставить раньше чем произойдёт import
const TMP = join(import.meta.dir, ".tmp");
process.env.CW_DATA_DIR = TMP;

import {
  readStore,
  writeStore,
  makeId,
  taskDuration,
  formatDuration,
  msToHours,
} from "../lib/store";
import type { Task, Store } from "../types";

// ── Хелпер: создаёт Task с разумными дефолтами ────────────────────────────
function task(overrides: Partial<Task> = {}): Task {
  return {
    id:        makeId(),
    name:      "Test task",
    tag:       "work",
    startedAt: Date.now() - 60_000,  // начата минуту назад
    pausedMs:  0,
    ...overrides,
  };
}

// ── Хелпер: базовый пустой Store ─────────────────────────────────────────
function emptyStore(overrides: Partial<Store> = {}): Store {
  return { history: [], goals: { dailyHours: 4 }, ...overrides };
}

// ── Setup / Teardown ──────────────────────────────────────────────────────
beforeEach(() => mkdirSync(TMP, { recursive: true }));
afterEach(()  => rmSync(TMP, { recursive: true, force: true }));


// ════════════════════════════════════════════════════════════════════════════
describe("readStore", () => {

  test("возвращает дефолт когда файла нет", async () => {
    const store = await readStore();
    expect(store.history).toEqual([]);
    expect(store.active).toBeUndefined();
    expect(store.goals.dailyHours).toBe(4);
  });

  test("читает ранее сохранённые данные", async () => {
    const t = task({ name: "Saved" });
    await writeStore(emptyStore({ history: [t] }));

    const store = await readStore();
    expect(store.history).toHaveLength(1);
    expect(store.history[0]?.name).toBe("Saved");
  });

  test("возвращает дефолт если файл битый JSON", async () => {
    await Bun.write(join(TMP, "data.json"), "{ broken json {{");

    const store = await readStore();
    expect(store.history).toEqual([]);
  });

  test("дефолты независимы — мутация одного не ломает другой", async () => {
    const a = await readStore();
    const b = await readStore();
    a.goals.dailyHours = 99;
    expect(b.goals.dailyHours).toBe(4);  // b не должен измениться
  });

});


// ════════════════════════════════════════════════════════════════════════════
describe("writeStore", () => {

  test("создаёт файл если его не было", async () => {
    await writeStore(emptyStore());
    expect(existsSync(join(TMP, "data.json"))).toBe(true);
  });

  test("то что записали — то и прочитали", async () => {
    const t = task({ name: "Round trip" });
    await writeStore(emptyStore({ history: [t], goals: { dailyHours: 6 } }));

    const store = await readStore();
    expect(store.history[0]?.name).toBe("Round trip");
    expect(store.goals.dailyHours).toBe(6);
  });

  test("перезаписывает предыдущие данные", async () => {
    await writeStore(emptyStore({ history: [task({ name: "Old" })] }));
    await writeStore(emptyStore({ history: [task({ name: "New" })] }));

    const store = await readStore();
    expect(store.history).toHaveLength(1);
    expect(store.history[0]?.name).toBe("New");
  });

  test("сохраняет активную задачу", async () => {
    const active = task({ name: "Active" });
    await writeStore(emptyStore({ active }));

    const store = await readStore();
    expect(store.active?.name).toBe("Active");
  });

});


// ════════════════════════════════════════════════════════════════════════════
describe("makeId", () => {

  test("возвращает непустую строку", () => {
    expect(makeId().length).toBeGreaterThan(0);
  });

  test("каждый id уникален", () => {
    const ids = Array.from({ length: 100 }, () => makeId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  test("содержит только допустимые символы (base36 + случайные)", () => {
    const id = makeId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

});


// ════════════════════════════════════════════════════════════════════════════
describe("taskDuration", () => {

  test("активная задача — считает до now", () => {
    const t = task({ startedAt: Date.now() - 5_000 });
    const dur = taskDuration(t);
    // небольшая погрешность на выполнение кода
    expect(dur).toBeGreaterThan(4_800);
    expect(dur).toBeLessThan(6_000);
  });

  test("завершённая задача — точная длительность", () => {
    const start = Date.now() - 10_000;
    const t = task({ startedAt: start, stoppedAt: start + 10_000 });
    expect(taskDuration(t)).toBe(10_000);
  });

  test("вычитает накопленное время паузы (pausedMs)", () => {
    const start = Date.now() - 20_000;
    const t = task({
      startedAt: start,
      stoppedAt: start + 20_000,
      pausedMs:  5_000,   // 5 сек были на паузе
    });
    expect(taskDuration(t)).toBe(15_000);
  });

  test("вычитает активную паузу (pausedAt)", () => {
    const now = Date.now();
    const t = task({
      startedAt: now - 30_000,
      pausedMs:  0,
      pausedAt:  now - 10_000,  // поставили на паузу 10 сек назад
    });
    const dur = taskDuration(t);
    // работала 30с, из них 10с пауза → ~20с
    expect(dur).toBeGreaterThan(19_000);
    expect(dur).toBeLessThan(21_000);
  });

  test("pausedMs + pausedAt складываются", () => {
    const now = Date.now();
    const t = task({
      startedAt: now - 60_000,
      pausedMs:  10_000,        // прошлая пауза 10с
      pausedAt:  now - 5_000,   // текущая пауза 5с
    });
    const dur = taskDuration(t);
    // 60с - 10с - 5с = ~45с
    expect(dur).toBeGreaterThan(44_000);
    expect(dur).toBeLessThan(46_000);
  });

  test("принимает кастомный now", () => {
    const start = 1_000_000;
    const t = task({ startedAt: start, pausedMs: 0 });
    expect(taskDuration(t, start + 30_000)).toBe(30_000);
  });

  test("нулевая задача — 0", () => {
    const now = Date.now();
    const t = task({ startedAt: now, stoppedAt: now, pausedMs: 0 });
    expect(taskDuration(t)).toBe(0);
  });

});


// ════════════════════════════════════════════════════════════════════════════
describe("formatDuration", () => {

  test("0 ms → 0s", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  test("секунды (< 60s)", () => {
    expect(formatDuration(45_000)).toBe("45s");
    expect(formatDuration(1_000)).toBe("1s");
    expect(formatDuration(59_000)).toBe("59s");
  });

  test("минуты и секунды (< 1h)", () => {
    expect(formatDuration(90_000)).toBe("1m 30s");
    expect(formatDuration(125_000)).toBe("2m 05s");
    expect(formatDuration(600_000)).toBe("10m 00s");
  });

  test("часы и минуты (>= 1h)", () => {
    expect(formatDuration(3_600_000)).toBe("1h 00m");
    expect(formatDuration(3_720_000)).toBe("1h 02m");
    expect(formatDuration(7_200_000)).toBe("2h 00m");
  });

  test("секунды не показываются когда есть часы", () => {
    // 1h 2m 45s — секунды должны быть скрыты
    expect(formatDuration(3_765_000)).toBe("1h 02m");
  });

  test("минуты паддятся нулём", () => {
    expect(formatDuration(3_660_000)).toBe("1h 01m");   // 1h 01m не 1h 1m
    expect(formatDuration(65_000)).toBe("1m 05s");      // 1m 05s не 1m 5s
  });

});


// ════════════════════════════════════════════════════════════════════════════
describe("msToHours", () => {

  test("1 час", ()    => expect(msToHours(3_600_000)).toBe(1));
  test("30 минут",() => expect(msToHours(1_800_000)).toBe(0.5));
  test("0",       () => expect(msToHours(0)).toBe(0));
  test("90 минут",() => expect(msToHours(5_400_000)).toBeCloseTo(1.5));

});


// ════════════════════════════════════════════════════════════════════════════
describe("flow: start → pause → resume → stop", () => {

  test("полный жизненный цикл задачи", async () => {
    // 1. start
    const t = task({ startedAt: Date.now() - 20_000 });
    await writeStore(emptyStore({ active: t }));

    // 2. pause
    let store = await readStore();
    store.active!.pausedAt = Date.now() - 5_000;
    await writeStore(store);

    // 3. resume
    store = await readStore();
    const pausedAt = store.active!.pausedAt!;
    store.active!.pausedMs += Date.now() - pausedAt;
    store.active!.pausedAt = undefined;
    await writeStore(store);

    // 4. stop
    store = await readStore();
    store.active!.stoppedAt = Date.now();
    store.history.push(store.active!);
    store.active = undefined;
    await writeStore(store);

    // проверяем результат
    const result = await readStore();
    expect(result.active).toBeUndefined();
    expect(result.history).toHaveLength(1);

    const finished = result.history[0];
    if (!finished) throw new Error('unreachable');
    expect(finished?.stoppedAt).toBeDefined();
    expect(finished?.pausedMs).toBeGreaterThan(4_000);  // пауза ~5с

    // duration должна быть ~15с (20с работы - 5с паузы)
    const dur = taskDuration(finished);
    expect(dur).toBeGreaterThan(14_000);
    expect(dur).toBeLessThan(17_000);
    
  });

  test("вторая задача останавливает первую", async () => {
    const first = task({ name: "First" });
    await writeStore(emptyStore({ active: first }));

    // start второй — должны сначала закрыть первую
    let store = await readStore();
    store.active!.stoppedAt = Date.now();
    store.history.push(store.active!);
    store.active = task({ name: "Second" });
    await writeStore(store);

    const result = await readStore();
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.name).toBe("First");
    expect(result.active?.name).toBe("Second");
  });

});
