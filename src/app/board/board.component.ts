import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AutofocusDirective } from '../shared/autofocus.directive';
import { DialogsService } from '../shared/dialogs.service';
import { ColumnView } from './board.models';
import { BoardStore } from './board.store';
import { ColumnComponent } from './column.component';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, ColumnComponent, AutofocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- cdkDropListGroup connects every cdkDropList inside it, so cards can move between columns -->
    <div cdkDropListGroup class="flex h-full items-start gap-4 overflow-x-auto px-4 pb-4 sm:px-6">
      @for (column of store.view(); track column.id) {
        <app-column
          class="flex max-h-full"
          [column]="column"
          [isDone]="column.id === store.doneColumnId()"
          (openCard)="openCard($event.cardId, $event.columnId)"
          (newCard)="createCard($event)"
          (deleteColumn)="confirmDeleteColumn($event)"
        />
      }

      <div class="w-72 shrink-0 sm:w-80">
        @if (addingColumn()) {
          <div class="rounded-2xl bg-slate-100/80 p-3">
            <input
              #title
              appAutofocus
              maxlength="40"
              placeholder="Column name"
              class="field text-sm"
              (keydown.enter)="addColumn(title.value)"
              (keydown.escape)="addingColumn.set(false)"
            />
            <div class="mt-2 flex gap-2">
              <button type="button" class="btn-primary py-1.5 text-sm" (click)="addColumn(title.value)">Add column</button>
              <button type="button" class="btn-secondary py-1.5 text-sm" (click)="addingColumn.set(false)">Cancel</button>
            </div>
          </div>
        } @else {
          <button
            type="button"
            class="w-full rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-left text-sm font-medium
              text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
            (click)="addingColumn.set(true)"
          >
            + Add column
          </button>
        }
      </div>
    </div>
  `,
})
export class BoardComponent {
  protected readonly store = inject(BoardStore);
  private readonly dialogs = inject(DialogsService);

  protected readonly addingColumn = signal(false);

  protected addColumn(title: string): void {
    const trimmed = title.trim();
    if (trimmed) this.store.addColumn(trimmed);
    this.addingColumn.set(false);
  }

  protected async createCard(columnId: string): Promise<void> {
    const result = await this.dialogs.editCard({ columnId, columns: this.columnOptions() });
    if (result?.action === 'save') this.store.addCard(result.columnId, result.input);
  }

  protected async openCard(cardId: string, columnId: string): Promise<void> {
    const card = this.store.cards()[cardId];
    if (!card) return;

    const result = await this.dialogs.editCard({ card, columnId, columns: this.columnOptions() });
    if (!result) return;

    if (result.action === 'delete') {
      const ok = await this.dialogs.confirm({
        title: 'Delete task?',
        message: `"${card.title}" will be removed permanently.`,
        confirmText: 'Delete',
      });
      if (ok) this.store.removeCard(cardId);
      return;
    }

    this.store.updateCard(cardId, result.input);
    if (result.columnId !== columnId) this.store.moveCardToColumn(cardId, result.columnId);
  }

  protected async confirmDeleteColumn(column: ColumnView): Promise<void> {
    if (column.totalCount > 0) {
      const ok = await this.dialogs.confirm({
        title: `Delete "${column.title}"?`,
        message: `The column and its ${column.totalCount} task(s) will be removed permanently.`,
        confirmText: 'Delete column',
      });
      if (!ok) return;
    }
    this.store.removeColumn(column.id);
  }

  private columnOptions(): Array<{ id: string; title: string }> {
    return this.store.columns().map(({ id, title }) => ({ id, title }));
  }
}
