# clockwork ⏱

Минималистичный CLI трекер времени на Bun.js. Нет базы данных, нет зависимостей — только JSON файл в `~/.clockwork/data.json`.

## Установка

```bash
git clone <repo>
cd clockwork

# запуск через bun
bun index.ts

# или скомпилировать в бинарник
bun build index.ts --compile --outfile=cw
sudo mv cw /usr/local/bin/cw
```

## Быстрый старт

```bash
# запустить задачу
bun cw start "Design system refactor" --tag=work --est=90

# живые часы + прогресс
bun cw

# остановить
bun cw stop

# отчёт за неделю
bun cw report

# лог сегодня
bun cw log
```

## Команды

| Команда | Описание |
|---|---|
| `bun cw` | Живые часы + активная задача |
| `bun cw start [name]` | Начать задачу (интерактивный ввод если без args) |
| `bun cw stop` | Остановить |
| `bun cw pause / resume` | Пауза |
| `bun cw status` | Статус активной задачи |
| `bun cw log` | Лог за сегодня |
| `bun cw log --week` | Лог за неделю |
| `bun cw report` | Отчёт с ASCII-барами по тегам |
| `bun cw report --month` | За месяц |
| `bun cw add "Task" --tag=work --dur=45 --at=09:00` | Добавить ручную запись |
| `bun cw goal set 8h` | Установить дневную цель |
| `bun cw export --csv` | Экспорт в CSV (stdout) |
| `bun cw export --json` | Экспорт в JSON |

## Теги

`work` · `personal` · `study` · `health` · `other`

## Данные

Всё хранится в `~/.clockwork/data.json`. Можно бэкапить, синхронизировать через Dropbox/iCloud, открывать в любом редакторе.
