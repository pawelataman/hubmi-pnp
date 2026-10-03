import type { ReactElement } from 'react';

import { PERSONA_IDS, PERSONAS } from '../api/personas';
import type { Persona, PersonaId, PersonaRole } from '../api/types';
import { useSession } from '../app/contexts';
import { Button } from '../ui/Button';
import styles from './PersonaPicker.module.css';

interface PersonaPickerProps {
  /** `curator` limits the list to the curator. */
  readonly requiredRole: PersonaRole | null;
  readonly onDone: (chosen: boolean) => void;
}

export function PersonaPicker({
  requiredRole,
  onDone,
}: PersonaPickerProps): ReactElement {
  const { signIn } = useSession();
  const choices: readonly Persona[] = PERSONA_IDS.map(
    (id: PersonaId): Persona => PERSONAS[id],
  ).filter(
    (persona: Persona): boolean =>
      requiredRole !== 'curator' || persona.role === 'curator',
  );

  return (
    <div className={styles['backdrop']}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wybierz osobę"
        className={styles['dialog']}
      >
        <h2 className={styles['title']}>Wybierz osobę</h2>
        <p className={styles['lead']}>
          {requiredRole === 'curator'
            ? 'Panel ROPS jest dostępny dla kuratora.'
            : 'To wersja demonstracyjna. Zaloguj się jako jedna z przykładowych osób.'}
        </p>
        <ul className={styles['list']}>
          {choices.map((persona: Persona): ReactElement => (
            <li key={persona.id}>
              <button
                type="button"
                className={styles['choice']}
                onClick={(): void => {
                  signIn(persona.id);
                  onDone(true);
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
    </div>
  );
}
