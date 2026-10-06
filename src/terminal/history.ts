export const HISTORY_LIMIT = 100;

export interface HistoryState {
  /** Oldest first. */
  readonly entries: readonly string[];
  /** Index being shown while browsing with ↑/↓; null when editing a fresh line. */
  readonly cursor: number | null;
  /** What was typed before browsing started, restored when you go past the newest entry. */
  readonly draft: string;
}

export const emptyHistory: HistoryState = { entries: [], cursor: null, draft: '' };

export interface HistoryStep {
  readonly state: HistoryState;
  readonly value: string;
}

/** Record a submitted line. Blanks and repeats of the previous line are skipped. */
export function pushHistory(state: HistoryState, line: string): HistoryState {
  const trimmed = line.trim();
  const last = state.entries[state.entries.length - 1];
  const entries =
    trimmed === '' || trimmed === last
      ? state.entries
      : [...state.entries, trimmed].slice(-HISTORY_LIMIT);
  return { entries, cursor: null, draft: '' };
}

/** ↑: step back to an older entry. */
export function historyPrev(state: HistoryState, input: string): HistoryStep {
  if (state.entries.length === 0) return { state, value: input };
  const draft = state.cursor === null ? input : state.draft;
  const cursor = state.cursor === null ? state.entries.length - 1 : Math.max(0, state.cursor - 1);
  return { state: { ...state, cursor, draft }, value: state.entries[cursor] ?? input };
}

/** ↓: step forward; past the newest entry, the draft comes back. */
export function historyNext(state: HistoryState, input: string): HistoryStep {
  if (state.cursor === null) return { state, value: input };
  const cursor = state.cursor + 1;
  if (cursor >= state.entries.length) {
    return { state: { ...state, cursor: null, draft: '' }, value: state.draft };
  }
  return { state: { ...state, cursor }, value: state.entries[cursor] ?? input };
}
