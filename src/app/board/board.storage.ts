import { BoardState } from './board.models';

// Bump the version if BoardState ever changes shape, so old saved data isn't misread
export const STORAGE_KEY = 'taskflow.board.v1';

function isBoardState(value: unknown): value is BoardState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<BoardState>;
  return (
    Array.isArray(v.columns) &&
    v.columns.every((c) => typeof c?.id === 'string' && typeof c.title === 'string' && Array.isArray(c.cardIds)) &&
    typeof v.cards === 'object' &&
    v.cards !== null
  );
}

/** Returns the saved board, or null if there is none or it's unreadable. */
export function loadBoard(): BoardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isBoardState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBoard(board: BoardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // Storage full or blocked — the board still works for this session
  }
}
