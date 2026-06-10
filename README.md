# bw ⏱

Минималистичный CLI трекер времени на Bun.js.

Нет базы данных — только JSON файл в `~/.clockwork/data.json`.

__0__ стороних библиотек только bun js

## Установка

```bash
git clone <repo>
cd clockwork

# запуск через bun
bun index.ts

# или скомпилировать в бинарник
bun build index.ts --compile --outfile=bw
sudo mv bw /usr/local/bin/bw
```

## Быстрый старт
> Иногда необходимо запускать через bun например bun bw 
```bash
# запустить задачу
bw new 

# живые часы + прогресс
bw

# остановить
bw stop

# отчёт за неделю
bw report

# лог сегодня
bw log
```

## Команды

| Команда | Описание |
|---|---|
| `bun bw` | Живые часы + активная задача |
| `bun bw start [name]` | Начать задачу (интерактивный ввод если без args) |
| `bun bw stop` | Остановить |
| `bun bw pause / resume` | Пауза |
| `bun bw status` | Статус активной задачи |
| `bun bw log` | Лог за сегодня |
| `bun bw log --week` | Лог за неделю |
| `bun bw report` | Отчёт с ASCII-барами по тегам |
| `bun bw report --month` | За месяц |
| `bun bw add "Task" --tag=work --dur=45 --at=09:00` | Добавить ручную запись |
| `bun bw goal set 8h` | Установить дневную цель |
| `bun bw export --csv` | Экспорт в CSV (stdout) |
| `bun bw export --json` | Экспорт в JSON |

## Теги

`работа` · `учеба` · `чилл` · `другое`
> Это теги по умолчанию - можно добавить собственные: 
```bash 

bw tag list

bun run index.ts tag add <имя> design --color=<цвет> --icon=<эмоджи>

```
## Цвета:
- reset: - отступ  
- bold:  - жирный
- dim:   - блеклый
- green:  
- yellow: 
- blue:  
- cyan:  
- white: 
- gray:   
- red:   
- magenta

## Данные

Всё хранится в `~/.clockwork/data.json`

Можно бэкапить, синхронизировать через Dropbox/iCloud, открывать в любом редакторе.

```bash
bun test                   # все тесты
bun test --watch           # следит за изменениями файлов
bun test --coverage        # покрытие 
```