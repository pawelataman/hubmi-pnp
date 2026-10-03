import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { getPersona, PERSONA_IDS } from '../api/personas';
import type { Persona, PersonaId, PersonaRole } from '../api/types';
import { useSession } from '../app/contexts';
import { Button } from '../ui/Button';
import styles from './PersonaPicker.module.css';

interface PersonaPickerProps {
  /** `curator` limits the list to the curator. */
  readonly requiredRole: PersonaRole | null;
  readonly onDone: (chosen: boolean) => void;
  /**
   * Replaces the default "sign in and close" when a persona is chosen, for a
   * caller that has to order the sign-in with a navigation.
   */
  readonly onChoose?: (persona: Persona) => void;
}

export function PersonaPicker({
  requiredRole,
  onDone,
  onChoose,
}: PersonaPickerProps): ReactElement {
  const { signIn, needsProfile } = useSession();
  const dialogRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  useEffect((): void => {
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onDone(false);
      return;
    }
    if (event.key !== 'Tab' || dialogRef.current === null) {
      return;
    }
    const focusable: HTMLElement[] = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button'),
    );
    const first: HTMLElement | undefined = focusable[0];
    const last: HTMLElement | undefined = focusable[focusable.length - 1];
    if (first === undefined || last === undefined) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onDone(false);
    }
  }
  const choices: readonly Persona[] = PERSONA_IDS.map(
    (id: PersonaId): Persona => getPersona(id, needsProfile),
  ).filter(
    (persona: Persona): boolean =>
      (persona.id !== 'beneficiary' || needsProfile !== null) &&
      (requiredRole !== 'curator' || persona.role === 'curator'),
  );

  // The layout roots are size containers, which makes them the containing
  // block of fixed descendants; the backdrop must cover the viewport instead.
  return createPortal(
    <div
      className={styles['backdrop']}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Wybierz osobę"
        className={styles['dialog']}
      >
        <h2 className={styles['title']}>Wybierz osobę</h2>
        <p className={styles['lead']}>
          {requiredRole === 'curator'
            ? 'Panel ROPS jest dostępny dla kuratorki ROPS.'
            : 'To wersja demonstracyjna. Zaloguj się jako jedna z przykładowych osób.'}
        </p>
        <ul className={styles['list']}>
          {choices.map((persona: Persona): ReactElement => (
            <li key={persona.id}>
              <button
                type="button"
                className={styles['choice']}
                onClick={(): void => {
                  if (onChoose === undefined) {
                    signIn(persona.id);
                    onDone(true);
                  } else {
                    onChoose(persona);
                  }
                }}
              >
                <span className={styles['avatar']} aria-hidden="true">
                  {persona.initials}
                </span>
                <span>
                  <strong>{persona.name}</strong> — {persona.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Button
          variant="link"
          onClick={(): void => {
            onDone(false);
          }}
        >
          Anuluj
        </Button>
      </div>
    </div>,
    document.body,
  );
}
