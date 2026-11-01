# TaskFlow

A Kanban board for organising tasks: drag cards between columns, edit details in a dialog, filter by text or priority, and pick up where you left off — everything is saved in the browser.

Built with **Angular 20**, **Angular CDK** (drag & drop, dialog), **NgRx SignalStore** and **Tailwind CSS 4**. Business logic is covered by unit tests that run in CI.

> **Live demo:** [https://tiennd-taskflow.web.app](https://tiennd-taskflow.web.app)

<!-- Screenshots: docs/screenshots/board.png, dialog.png, filter.png -->

## Features

- **Drag and drop** — reorder cards inside a column or move them between columns, with animated placeholders.
- **Quick add** — type a title and press Enter to add several tasks in a row; "More details…" opens the full form.
- **Task details** — title, description, priority, labels, due date and status, edited in an accessible dialog.
- **Overdue highlighting** — past due dates turn red, except for tasks in the last ("done") column.
- **Columns** — add, rename (click the title) and delete columns; deleting asks for confirmation when it has tasks.
- **Search and filter** — by title, description or label (accent-insensitive) and by priority. Drag & drop pauses while filtering so the order can't get mixed up.
- **Live stats** — total, done and overdue counts in the header.
- **Persistence** — the board is saved to localStorage on every change; "Reset demo" restores sample data.
- **Responsive** — columns scroll horizontally on small screens.

## Tech highlights

| Area | What's used |
| --- | --- |
| State management | NgRx SignalStore: `withState`, `withComputed`, `withMethods`, `withHooks` (load + auto-save) |
| Architecture | Normalised state (cards stored once, columns hold ids); all updates are **pure functions** in `board.logic.ts` |
| Angular CDK | `cdkDropListGroup` / `cdkDropList` / `cdkDrag` with custom placeholder; unstyled `Dialog` with typed data and results |
| Angular | Standalone components, signals, `input()` / `output()`, `@let`, `OnPush`, `afterNextRender` in a custom autofocus directive |
| Forms | Typed reactive forms with `NonNullableFormBuilder` |
| Styling | Tailwind CSS 4 with a few component classes (`.field`, `.btn-primary`…) and styled CDK drag states |
| Testing | Jasmine + Karma: pure logic tests and store tests through `TestBed` |
| CI | GitHub Actions runs the tests in headless Chrome, then builds |

## Project structure

```
src/app
├── board/
│   ├── board.models.ts          # Card, Column, BoardState types
│   ├── board.logic.ts           # Pure state updates (move, add, remove…) + helpers
│   ├── board.logic.spec.ts      # Unit tests for the logic
│   ├── board.store.ts           # NgRx SignalStore
│   ├── board.store.spec.ts      # Store tests
│   ├── board.storage.ts         # localStorage load/save with validation
│   ├── board.component.ts       # Columns + drop list group + add column
│   ├── column.component.*       # One column: drop list, rename, quick add
│   ├── card.component.ts        # One card
│   └── card-dialog.component.*  # Create / edit dialog
└── shared/                      # Confirm dialog, dialog service, autofocus directive, colour helpers
```

## Getting started

```bash
npm install
npm start        # http://localhost:4200
npm test         # unit tests in Chrome (watch mode)
npm run test:ci  # single run, headless
```

## Roadmap

- Multiple boards
- Reorder columns by dragging
- Keyboard-only moving of cards
- Sync across devices with a backend

## License

MIT
