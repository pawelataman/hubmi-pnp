import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { usePendingFocus } from './usePendingFocus';

function Harness(): ReactElement {
  const { rootRef, requestFocus } = usePendingFocus<'target'>();
  const [renders, setRenders] = useState<number>(0);
  const [shown, setShown] = useState<boolean>(false);
  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={(): void => {
          requestFocus('target');
          setRenders(renders + 1);
        }}
      >
        Poproś
      </button>
      <button
        type="button"
        onClick={(): void => {
          setShown(true);
        }}
      >
        Pokaż
      </button>
      <button
        type="button"
        onClick={(): void => {
          setRenders(renders + 1);
        }}
      >
        Odśwież {String(renders)}
      </button>
      {shown ? (
        <button type="button" data-focus="target">
          Cel
        </button>
      ) : null}
    </div>
  );
}

describe('usePendingFocus', (): void => {
  it('keeps a request until its target is rendered', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    render(<Harness />);
    const request: HTMLElement = screen.getByRole('button', { name: 'Poproś' });
    await user.click(request);
    // The request caused a render, but the target is not there yet.
    expect(request).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Pokaż' }));
    expect(screen.getByRole('button', { name: 'Cel' })).toHaveFocus();
  });

  it('clears the request once the target was focused', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Pokaż' }));
    await user.click(screen.getByRole('button', { name: 'Poproś' }));
    expect(screen.getByRole('button', { name: 'Cel' })).toHaveFocus();
    const refresh: HTMLElement = screen.getByRole('button', {
      name: /^Odśwież/,
    });
    await user.click(refresh);
    expect(refresh).toHaveFocus();
  });
});
