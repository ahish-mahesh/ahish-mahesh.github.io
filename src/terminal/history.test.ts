import { describe, expect, it } from 'vitest';
import {
  HISTORY_LIMIT,
  emptyHistory,
  historyNext,
  historyPrev,
  pushHistory,
  type HistoryState,
} from './history.ts';

function withEntries(...lines: string[]): HistoryState {
  return lines.reduce(pushHistory, emptyHistory);
}

describe('pushHistory', () => {
  it('records trimmed lines, oldest first', () => {
    expect(withEntries('help', '  ls ').entries).toEqual(['help', 'ls']);
  });

  it('skips blanks and consecutive repeats', () => {
    expect(withEntries('help', '', '   ', 'help', 'ls', 'help').entries).toEqual([
      'help',
      'ls',
      'help',
    ]);
  });

  it('keeps only the newest entries past the limit', () => {
    const lines = Array.from({ length: HISTORY_LIMIT + 5 }, (_, i) => `cmd${String(i)}`);
    const { entries } = withEntries(...lines);
    expect(entries).toHaveLength(HISTORY_LIMIT);
    expect(entries[0]).toBe('cmd5');
  });

  it('resets browsing', () => {
    const browsing = historyPrev(withEntries('help'), 'dra').state;
    expect(pushHistory(browsing, 'ls')).toMatchObject({ cursor: null, draft: '' });
  });
});

describe('historyPrev / historyNext', () => {
  it('does nothing with no history', () => {
    expect(historyPrev(emptyHistory, 'abc').value).toBe('abc');
    expect(historyNext(emptyHistory, 'abc').value).toBe('abc');
  });

  it('walks back and stops at the oldest entry', () => {
    let step = historyPrev(withEntries('a', 'b', 'c'), '');
    expect(step.value).toBe('c');
    step = historyPrev(step.state, step.value);
    expect(step.value).toBe('b');
    step = historyPrev(step.state, step.value);
    expect(step.value).toBe('a');
    step = historyPrev(step.state, step.value);
    expect(step.value).toBe('a');
  });

  it('walks forward and restores the unsent draft', () => {
    let step = historyPrev(withEntries('a', 'b'), 'half typed');
    step = historyPrev(step.state, step.value);
    expect(step.value).toBe('a');
    step = historyNext(step.state, step.value);
    expect(step.value).toBe('b');
    step = historyNext(step.state, step.value);
    expect(step.value).toBe('half typed');
    expect(step.state.cursor).toBeNull();
  });
});
