import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';

import { ChoiceChip } from './ChoiceChip';
import { FieldError } from './FieldError';
import { LoadError } from './LoadError';
import { Stepper } from './Stepper';
import { Switch } from './Switch';

describe('ui kit', (): void => {
  it('ChoiceChip reports its state and toggles', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onToggle: Mock<() => void> = vi.fn<() => void>();
    render(<ChoiceChip label="KGW" selected onToggle={onToggle} />);
    const chip: HTMLElement = screen.getByRole('button', { name: 'KGW' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.click(chip);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('Switch exposes role and state', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onChange: Mock<(next: boolean) => void> =
      vi.fn<(next: boolean) => void>();
    render(
      <Switch checked={false} onChange={onChange}>
        Prosty język
      </Switch>,
    );
    const control: HTMLElement = screen.getByRole('switch', {
      name: 'Prosty język',
    });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('FieldError is an alert', (): void => {
    render(<FieldError>Opis jest za krótki.</FieldError>);
    expect(screen.getByRole('alert')).toHaveTextContent('Opis jest za krótki.');
  });

  it('LoadError retries', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onRetry: Mock<() => void> = vi.fn<() => void>();
    render(
      <LoadError message="Nie udało się wczytać danych." onRetry={onRetry} />,
    );
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('Stepper marks the current step', (): void => {
    render(
      <Stepper
        label="Kroki"
        items={[
          { label: '1. Gmina', state: 'done' },
          { label: '2. Odbiorcy', state: 'current' },
          { label: '3. Budżet', state: 'todo' },
        ]}
      />,
    );
    const steps: HTMLElement[] = screen.getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).toHaveTextContent('✓ 1. Gmina');
  });
});
