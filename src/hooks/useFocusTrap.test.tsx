import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from './useFocusTrap.ts';

function Trap({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <>
      <button type="button">before</button>
      <div ref={ref}>
        <button type="button">first</button>
        <input aria-label="middle" />
        <button type="button">last</button>
      </div>
      <button type="button">after</button>
    </>
  );
}

describe('useFocusTrap', () => {
  it('wraps Tab from the last element to the first', async () => {
    const user = userEvent.setup();
    render(<Trap active />);
    screen.getByRole('button', { name: 'last' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps Shift+Tab from the first element to the last', async () => {
    const user = userEvent.setup();
    render(<Trap active />);
    screen.getByRole('button', { name: 'first' }).focus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('leaves Tab alone in the middle', async () => {
    const user = userEvent.setup();
    render(<Trap active />);
    screen.getByRole('button', { name: 'first' }).focus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'middle' })).toHaveFocus();
  });

  it('pulls focus in from outside', async () => {
    const user = userEvent.setup();
    render(<Trap active />);
    screen.getByRole('button', { name: 'before' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('does nothing when inactive', async () => {
    const user = userEvent.setup();
    render(<Trap active={false} />);
    screen.getByRole('button', { name: 'last' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });
});
