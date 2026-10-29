import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PRIORITIES, PRIORITY_LABELS, Priority } from './board/board.models';
import { BoardStore } from './board/board.store';
import { DialogsService } from './shared/dialogs.service';

@Component({
  selector: 'app-root',
  imports: [BoardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-dvh flex-col">
      <header class="border-b border-slate-200 bg-white">
        <div class="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div class="mr-auto flex items-center gap-2">
            <img src="favicon.svg" alt="" width="28" height="28" />
            <h1 class="text-lg font-semibold">TaskFlow</h1>
          </div>

          <dl class="hidden items-center gap-4 text-sm text-slate-500 md:flex">
            <div><dt class="inline">Tasks </dt><dd class="inline font-semibold text-slate-900">{{ store.stats().total }}</dd></div>
            <div><dt class="inline">Done </dt><dd class="inline font-semibold text-emerald-600">{{ store.stats().done }}</dd></div>
            <div>
              <dt class="inline">Overdue </dt>
              <dd class="inline font-semibold" [class]="store.stats().overdue ? 'text-rose-600' : 'text-slate-900'">
                {{ store.stats().overdue }}
              </dd>
            </div>
          </dl>

          <button type="button" class="btn-secondary text-sm" (click)="resetDemo()">Reset demo</button>
        </div>

        <div class="flex flex-wrap items-center gap-2 px-4 pb-3 sm:px-6">
          <label class="relative min-w-48 flex-1 sm:max-w-xs">
            <span class="sr-only">Search tasks</span>
            <input
              type="search"
              placeholder="Search title, description, label…"
              class="field py-1.5 text-sm"
              [value]="store.filter.query()"
              (input)="store.setQuery($any($event.target).value)"
            />
          </label>

          <div class="flex gap-1" role="group" aria-label="Filter by priority">
            <button type="button" class="pill" [class.pill-active]="store.filter.priority() === 'all'" (click)="store.setPriority('all')">
              All
            </button>
            @for (p of priorities; track p) {
              <button type="button" class="pill" [class.pill-active]="store.filter.priority() === p" (click)="setPriority(p)">
                {{ priorityLabels[p] }}
              </button>
            }
          </div>

          @if (store.isFiltering()) {
            <span class="text-xs text-slate-500">Filtering — drag &amp; drop is paused.</span>
            <button type="button" class="text-xs font-medium text-indigo-600 hover:underline" (click)="store.clearFilter()">Clear</button>
          }
        </div>
      </header>

      <main class="min-h-0 flex-1 pt-4">
        <app-board class="block h-full" />
      </main>
    </div>
  `,
})
export class App {
  protected readonly store = inject(BoardStore);
  private readonly dialogs = inject(DialogsService);
  protected readonly priorities = PRIORITIES;
  protected readonly priorityLabels = PRIORITY_LABELS;

  protected setPriority(priority: Priority): void {
    this.store.setPriority(priority);
  }

  protected async resetDemo(): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: 'Reset the board?',
      message: 'All your columns and tasks will be replaced with the demo board.',
      confirmText: 'Reset',
    });
    if (ok) this.store.resetDemo();
  }
}
