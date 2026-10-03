import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { useToast } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import styles from './Composer.module.css';

interface ComposerProps {
  readonly label: string;
  readonly sendLabel: string;
  readonly onSend: (text: string) => Promise<void>;
  /** Extra control shown next to the label, e.g. the templates button. */
  readonly toolbar?: ReactNode;
}

export function Composer({
  label,
  sendLabel,
  onSend,
  toolbar,
}: ComposerProps): ReactElement {
  const id: string = useId();
  const { stub } = useToast();
  const field: RefObject<HTMLTextAreaElement | null> =
    useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  async function send(): Promise<void> {
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
      // The button is disabled while sending, which drops focus from it.
      field.current?.focus();
    }
  }

  return (
    <div className={cx(styles['composer'], failed && styles['failed'])}>
      <div className={styles['head']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        {toolbar}
      </div>
      {failed ? (
        <FieldError id={`${id}-error`}>
          Nie wysłano — brak połączenia. Tekst jest zapisany, spróbuj ponownie.
        </FieldError>
      ) : null}
      <textarea
        id={id}
        ref={field}
        className={styles['field']}
        placeholder="Napisz odpowiedź…"
        value={text}
        aria-describedby={failed ? `${id}-error` : undefined}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
          setText(event.target.value);
        }}
      />
      <div className={styles['actions']}>
        <Button variant="neutral" className={styles['attach']} onClick={stub}>
          ⎘ Dołącz plik
        </Button>
        <span className={styles['note']}>
          Rozmowa zostaje w HubMe. Nie używamy zewnętrznych komunikatorów.
        </span>
        <Button
          className={styles['send']}
          disabled={sending || text.trim() === ''}
          onClick={(): void => {
            void send();
          }}
        >
          {failed ? 'Spróbuj ponownie' : sendLabel}
        </Button>
      </div>
    </div>
  );
}
