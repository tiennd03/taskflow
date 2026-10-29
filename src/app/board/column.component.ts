import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ColumnView } from './board.models';
import { BoardStore } from './board.store';
import { CardComponent } from './card.component';
import { AutofocusDirective } from '../shared/autofocus.directive';

@Component({
  selector: 'app-column',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, CardComponent, AutofocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './column.component.html',
})
export class ColumnComponent {
  protected readonly store = inject(BoardStore);

  readonly column = input.required<ColumnView>();
  readonly isDone = input(false);

  readonly openCard = output<{ cardId: string; columnId: string }>();
  readonly newCard = output<string>();
  readonly deleteColumn = output<ColumnView>();

  protected readonly renaming = signal(false);
  protected readonly adding = signal(false);

  /** Called by CDK when a card is dropped into this column (from this or another column). */
  protected drop(event: CdkDragDrop<string>): void {
    const from = event.previousContainer.data;
    const to = event.container.data;
    if (from === to && event.previousIndex === event.currentIndex) return;
    this.store.moveCard(from, to, event.previousIndex, event.currentIndex);
  }

  protected finishRename(title: string): void {
    // Escape already closed the editor; the blur that follows must not save
    if (!this.renaming()) return;
    const trimmed = title.trim();
    if (trimmed && trimmed !== this.column().title) this.store.renameColumn(this.column().id, trimmed);
    this.renaming.set(false);
  }

  /** Quick add: Enter saves and keeps the box open for the next task, Esc closes it. */
  protected quickAdd(textarea: HTMLTextAreaElement, event?: Event): void {
    event?.preventDefault(); // stop Enter from adding a new line
    const title = textarea.value.trim();
    if (!title) {
      this.adding.set(false);
      return;
    }
    this.store.addCard(this.column().id, { title, description: '', priority: 'medium', labels: [], dueDate: null });
    textarea.value = '';
  }
}
