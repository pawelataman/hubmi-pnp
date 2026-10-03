import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type RefObject,
} from 'react';
import { Link } from 'react-router';

import type { ChipGroup, ProblemCard, Question } from '../../api/types';
import { AiBadge } from '../../ui/AiBadge';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { ChoiceChip } from '../../ui/ChoiceChip';
import styles from './ProblemCardScreen.module.css';

interface ProblemCardEditorProps {
  readonly initial: ProblemCard;
  readonly initialAnswers: Readonly<Record<string, string | null>>;
  readonly onConfirm: (
    card: ProblemCard,
    answers: Readonly<Record<string, string | null>>,
  ) => void;
}

function startingAnswers(
  card: ProblemCard,
  saved: Readonly<Record<string, string | null>>,
): Record<string, string | null> {
  const answers: Record<string, string | null> = {};
  for (const question of card.questions) {
    answers[question.id] =
      question.id in saved ? (saved[question.id] ?? null) : question.suggested;
  }
  return answers;
}

export function ProblemCardEditor({
  initial,
  initialAnswers,
  onConfirm,
}: ProblemCardEditorProps): ReactElement {
  const [summary, setSummary] = useState<string>(initial.summary);
  const [draftSummary, setDraftSummary] = useState<string | null>(null);
  const [groups, setGroups] = useState<readonly ChipGroup[]>(initial.groups);
  const [adding, setAdding] = useState<string | null>(null);
  const [newChip, setNewChip] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string | null>>(
    (): Record<string, string | null> =>
      startingAnswers(initial, initialAnswers),
  );

  const root: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const pendingFocus: RefObject<string | null> = useRef<string | null>(null);

  // Runs after every render; moves focus to a control that replaced the
  // one the user just activated.
  useEffect((): void => {
    const target: string | null = pendingFocus.current;
    if (target === null || root.current === null) {
      return;
    }
    pendingFocus.current = null;
    for (const element of root.current.querySelectorAll<HTMLElement>(
      '[data-focus]',
    )) {
      if (element.dataset['focus'] === target) {
        element.focus();
        return;
      }
    }
  });

  function removeChip(groupId: string, chip: string): void {
    const chips: readonly string[] =
      groups.find((group: ChipGroup): boolean => group.id === groupId)?.chips ??
      [];
    const index: number = chips.indexOf(chip);
    const neighbour: string | undefined = chips[index + 1] ?? chips[index - 1];
    pendingFocus.current =
      neighbour === undefined
        ? `add:${groupId}`
        : `remove:${groupId}:${neighbour}`;
    setGroups((current: readonly ChipGroup[]): readonly ChipGroup[] =>
      current.map((group: ChipGroup): ChipGroup =>
        group.id === groupId
          ? {
              ...group,
              chips: group.chips.filter(
                (item: string): boolean => item !== chip,
              ),
            }
          : group,
      ),
    );
  }

  function addChip(groupId: string): void {
    const value: string = newChip.trim();
    if (value !== '') {
      setGroups((current: readonly ChipGroup[]): readonly ChipGroup[] =>
        current.map((group: ChipGroup): ChipGroup =>
          group.id === groupId && !group.chips.includes(value)
            ? { ...group, chips: [...group.chips, value] }
            : group,
        ),
      );
    }
    cancelAdd(groupId);
  }

  function cancelAdd(groupId: string): void {
    pendingFocus.current = `add:${groupId}`;
    setAdding(null);
    setNewChip('');
  }

  function answer(questionId: string, option: string | null): void {
    setAnswers(
      (
        current: Record<string, string | null>,
      ): Record<string, string | null> => ({
        ...current,
        [questionId]: option,
      }),
    );
  }

  function confirm(): void {
    onConfirm({ ...initial, summary, groups }, answers);
  }

  return (
    <div ref={root} className={styles['root']}>
      <div className={styles['columns']}>
        <section className={styles['summaryCard']}>
          <div className={styles['summaryHead']}>
            <AiBadge label="Sugestia AI, do weryfikacji" />
            {draftSummary === null ? (
              <button
                type="button"
                className={styles['textButton']}
                data-focus="edit-summary"
                onClick={(): void => {
                  setDraftSummary(summary);
                }}
              >
                Popraw streszczenie
              </button>
            ) : null}
          </div>
          {draftSummary === null ? (
            <p className={styles['summary']}>
              <strong>Rozumiem, że</strong> {summary}
            </p>
          ) : (
            <div className={styles['editor']}>
              <textarea
                aria-label="Streszczenie"
                autoFocus
                className={styles['textarea']}
                value={draftSummary}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                  setDraftSummary(event.target.value);
                }}
              />
              <Button
                onClick={(): void => {
                  pendingFocus.current = 'edit-summary';
                  setSummary(draftSummary.trim());
                  setDraftSummary(null);
                }}
              >
                Zapisz streszczenie
              </Button>
            </div>
          )}
          <div className={styles['groups']}>
            {groups.map((group: ChipGroup): ReactElement => (
              <div key={group.id} className={styles['group']}>
                <span className={styles['groupLabel']}>{group.label}</span>
                <div className={styles['chips']}>
                  {group.chips.map((chip: string): ReactElement => (
                    <span key={chip} className={styles['chip']}>
                      {chip}
                      <button
                        type="button"
                        aria-label={`Usuń ${chip}`}
                        data-focus={`remove:${group.id}:${chip}`}
                        className={styles['remove']}
                        onClick={(): void => {
                          removeChip(group.id, chip);
                        }}
                      >
                        <span
                          className={styles['removeMark']}
                          aria-hidden="true"
                        >
                          ✕
                        </span>
                      </button>
                    </span>
                  ))}
                  {adding === group.id ? (
                    <input
                      type="text"
                      aria-label={`Nowy element: ${group.label}`}
                      className={styles['addInput']}
                      value={newChip}
                      autoFocus
                      onChange={(
                        event: ChangeEvent<HTMLInputElement>,
                      ): void => {
                        setNewChip(event.target.value);
                      }}
                      onKeyDown={(
                        event: KeyboardEvent<HTMLInputElement>,
                      ): void => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChip(group.id);
                        }
                        if (event.key === 'Escape') {
                          cancelAdd(group.id);
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={`Dodaj: ${group.label}`}
                      data-focus={`add:${group.id}`}
                      className={styles['add']}
                      onClick={(): void => {
                        setAdding(group.id);
                        setNewChip('');
                      }}
                    >
                      + Dodaj
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className={styles['questions']}>
          <div className={styles['questionsHead']}>
            <strong className={styles['questionsTitle']}>
              3 krótkie pytania
            </strong>
            <span className={styles['questionsLead']}>
              Pomogą lepiej dobrać wyniki. Każde możesz pominąć.
            </span>
          </div>
          {initial.questions.map((question: Question): ReactElement => (
            <div
              key={question.id}
              role="group"
              aria-labelledby={`question-${question.id}`}
              className={styles['question']}
            >
              <strong
                id={`question-${question.id}`}
                className={styles['questionTitle']}
              >
                {question.title}
              </strong>
              <div className={styles['options']}>
                {question.options.map((option: string): ReactElement => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={answers[question.id] === option}
                    onToggle={(): void => {
                      answer(question.id, option);
                    }}
                  />
                ))}
                <button
                  type="button"
                  aria-label={`Pomiń: ${question.title}`}
                  className={styles['skip']}
                  onClick={(): void => {
                    answer(question.id, null);
                  }}
                >
                  Pomiń
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
      <div className={styles['actions']}>
        <Button size="lg" onClick={confirm}>
          Szukaj rozwiązań →
        </Button>
        <Link to="/znajdz/podglad" className={buttonClass('link', 'lg')}>
          ← Wróć
        </Link>
      </div>
    </div>
  );
}
