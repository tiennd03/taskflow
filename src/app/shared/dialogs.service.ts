import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CardDialogComponent, CardDialogData, CardDialogResult } from '../board/card-dialog.component';
import { ConfirmData, ConfirmDialogComponent } from './confirm-dialog.component';

/** Opens dialogs and returns their result as a Promise, so callers can simply `await` it. */
@Injectable({ providedIn: 'root' })
export class DialogsService {
  private readonly dialog = inject(Dialog);

  async confirm(data: ConfirmData): Promise<boolean> {
    const ref = this.dialog.open<boolean, ConfirmData>(ConfirmDialogComponent, { data });
    return (await firstValueFrom(ref.closed)) === true;
  }

  async editCard(data: CardDialogData): Promise<CardDialogResult | undefined> {
    const ref = this.dialog.open<CardDialogResult, CardDialogData>(CardDialogComponent, { data });
    return firstValueFrom(ref.closed);
  }
}
