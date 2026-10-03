import { PERSONAS } from '../personas';
import type {
  CaseSummary,
  CaseThread,
  IdeaForm,
  Message,
  Notification,
  PersonaId,
  QueueFilter,
  QueuePage,
  QueueRow,
  SubmittedCase,
} from '../types';
import {
  QUEUE_BASE,
  seedCases,
  seedNotifications,
  type StoredCase,
} from './data/cases';
import { addDays, dayMonth, dayMonthTime, longDate } from './dates';

type Listener = (notification: Notification) => void;

export interface Store {
  submitIdea(idea: IdeaForm, author: PersonaId | null): SubmittedCase;
  listMyCases(persona: PersonaId): readonly CaseSummary[];
  getCase(id: string): CaseThread;
  sendMessage(caseId: string, from: PersonaId, text: string): CaseThread;
  listQueue(filter: QueueFilter): QueuePage;
  listNotifications(persona: PersonaId): readonly Notification[];
  markAllRead(persona: PersonaId): void;
  subscribe(persona: PersonaId, onNew: Listener): () => void;
}

const REPLY_DAYS: number = 7;

function toThread(stored: StoredCase): CaseThread {
  return {
    id: stored.id,
    type: stored.type,
    title: stored.title,
    status: stored.status,
    authorId: stored.authorId,
    area: stored.area,
    place: stored.place,
    stage: stored.stage,
    expert: stored.expert,
    timeline: { ...stored.timeline },
    messages: [...stored.messages],
  };
}

function toRow(stored: StoredCase): QueueRow {
  return {
    id: stored.id,
    type: stored.type,
    title: stored.title,
    area: stored.area,
    place: stored.place,
    date: stored.date,
    status: stored.status,
    expert: stored.expert,
    flagged: stored.flagged,
  };
}

export function createStore(now: () => Date = (): Date => new Date()): Store {
  const cases: StoredCase[] = seedCases();
  const notifications: Map<PersonaId, Notification[]> = seedNotifications();
  const pending: Map<PersonaId, Notification[]> = new Map<
    PersonaId,
    Notification[]
  >();
  const listeners: Map<PersonaId, Set<Listener>> = new Map<
    PersonaId,
    Set<Listener>
  >();
  let nextCaseNumber: number = 143;
  let nextNotification: number = 100;
  let added: number = 0;

  function find(id: string): StoredCase {
    const found: StoredCase | undefined = cases.find(
      (item: StoredCase): boolean => item.id === id,
    );
    if (found === undefined) {
      throw new Error('Nie znaleziono zgłoszenia.');
    }
    return found;
  }

  function notify(persona: PersonaId, notification: Notification): void {
    const list: Notification[] = notifications.get(persona) ?? [];
    notifications.set(persona, [notification, ...list]);
    const active: Set<Listener> | undefined = listeners.get(persona);
    if (active !== undefined && active.size > 0) {
      for (const listener of active) {
        listener(notification);
      }
      return;
    }
    pending.set(persona, [...(pending.get(persona) ?? []), notification]);
  }

  return {
    submitIdea(idea: IdeaForm, author: PersonaId | null): SubmittedCase {
      const date: Date = now();
      const id: string = `HUB-2026-${String(nextCaseNumber).padStart(4, '0')}`;
      nextCaseNumber += 1;
      added += 1;
      const first: Message = {
        id: `${id}-m1`,
        from: author,
        authorName: author === null ? 'Zgłaszający' : PERSONAS[author].name,
        initials: author === null ? 'Z' : PERSONAS[author].initials,
        role: author === null ? 'Zgłaszający' : PERSONAS[author].threadRole,
        time: dayMonthTime(date),
        text: idea.summary,
      };
      cases.unshift({
        id,
        type: 'Pomysł',
        title: idea.name,
        area: idea.audience,
        place: 'nie podano',
        date: dayMonth(date),
        status: 'Nowe',
        expert: null,
        flagged: false,
        authorId: author,
        stage: idea.stage,
        timeline: {
          sent: dayMonth(date),
          inProgress: null,
          answered: null,
          closed: null,
        },
        messages: [first],
      });
      return {
        id,
        title: idea.name,
        replyBy: longDate(addDays(date, REPLY_DAYS)),
      };
    },

    listMyCases(persona: PersonaId): readonly CaseSummary[] {
      return cases
        .filter((item: StoredCase): boolean => item.authorId === persona)
        .map((item: StoredCase): CaseSummary => ({
          id: item.id,
          type: item.type,
          title: item.title,
          status: item.status,
        }));
    },

    getCase(id: string): CaseThread {
      return toThread(find(id));
    },

    sendMessage(caseId: string, from: PersonaId, text: string): CaseThread {
      const stored: StoredCase = find(caseId);
      const date: Date = now();
      stored.messages.push({
        id: `${caseId}-m${String(stored.messages.length + 1)}`,
        from,
        authorName: PERSONAS[from].name,
        initials: PERSONAS[from].initials,
        role: PERSONAS[from].threadRole,
        time: dayMonthTime(date),
        text,
      });
      if (PERSONAS[from].role === 'curator') {
        stored.status = 'Odpowiedziano';
        stored.timeline = {
          ...stored.timeline,
          inProgress: stored.timeline.inProgress ?? dayMonth(date),
          answered: dayMonth(date),
        };
        if (stored.authorId !== null) {
          nextNotification += 1;
          const subject: string =
            stored.type === 'Pomysł' ? 'Twój pomysł' : 'Twoje zgłoszenie';
          notify(stored.authorId, {
            id: `n${String(nextNotification)}`,
            icon: '↩',
            text: `ROPS odpowiedział na ${subject} »${stored.title}«`,
            type: 'Odpowiedź',
            time: 'przed chwilą',
            unread: true,
            caseId,
          });
        }
      }
      return toThread(stored);
    },

    listQueue(filter: QueueFilter): QueuePage {
      const rows: QueueRow[] = cases
        .filter(
          (item: StoredCase): boolean =>
            filter.type === null || item.type === filter.type,
        )
        .map(toRow);
      return {
        rows,
        total: QUEUE_BASE.total + added,
        open: QUEUE_BASE.total + added,
        fresh: QUEUE_BASE.fresh + added,
        overdue: QUEUE_BASE.overdue,
      };
    },

    listNotifications(persona: PersonaId): readonly Notification[] {
      return [...(notifications.get(persona) ?? [])];
    },

    markAllRead(persona: PersonaId): void {
      notifications.set(
        persona,
        (notifications.get(persona) ?? []).map(
          (item: Notification): Notification => ({ ...item, unread: false }),
        ),
      );
    },

    subscribe(persona: PersonaId, onNew: Listener): () => void {
      const queued: Notification[] = pending.get(persona) ?? [];
      pending.delete(persona);
      for (const notification of queued) {
        onNew(notification);
      }
      const active: Set<Listener> =
        listeners.get(persona) ?? new Set<Listener>();
      active.add(onNew);
      listeners.set(persona, active);
      return (): void => {
        active.delete(onNew);
      };
    },
  };
}
