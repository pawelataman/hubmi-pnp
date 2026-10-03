import { describe, expect, it } from 'vitest';

import type {
  CaseSummary,
  CaseThread,
  IdeaForm,
  Notification,
  QueuePage,
  QueueRow,
  SubmittedCase,
} from '../types';
import { createStore, type Store } from './store';

const idea: IdeaForm = {
  name: 'Wiejski klub filmowy',
  summary: 'Raz w miesiącu kino w świetlicy.',
  audience: 'Mieszkańcy wsi',
  problem: 'Brak kultury na miejscu',
  stage: 'Pomysł',
  email: '',
};

function fixedNow(): Date {
  return new Date(2026, 9, 14, 9, 30);
}

describe('store', (): void => {
  it('seeds the queue with the example rows and totals', (): void => {
    const store: Store = createStore(fixedNow);
    const page: QueuePage = store.listQueue({ type: null });
    expect(page.rows).toHaveLength(9);
    expect(page.rows[0]?.title).toBe('Sąsiedzka kawiarenka');
    expect(page).toMatchObject({ total: 38, open: 38, fresh: 12, overdue: 4 });
  });

  it('filters the queue by type', (): void => {
    const store: Store = createStore(fixedNow);
    const page: QueuePage = store.listQueue({ type: 'Pomysł' });
    expect(page.rows.map((row: QueueRow): string => row.title)).toEqual([
      'Sąsiedzka kawiarenka',
      'Wiejska biblioteka rzeczy',
    ]);
  });

  it('creates a case from an idea, first in the queue and in the author list', (): void => {
    const store: Store = createStore(fixedNow);
    const submitted: SubmittedCase = store.submitIdea(idea, 'maria');
    expect(submitted).toEqual({
      id: 'HUB-2026-0143',
      title: 'Wiejski klub filmowy',
      replyBy: '21 października 2026',
    });
    const page: QueuePage = store.listQueue({ type: null });
    expect(page.rows[0]).toMatchObject({
      id: 'HUB-2026-0143',
      type: 'Pomysł',
      status: 'Nowe',
      date: '14.10',
    });
    expect(page).toMatchObject({ total: 39, open: 39, fresh: 13 });
    expect(
      store.listMyCases('maria').map((item: CaseSummary): string => item.id),
    ).toContain('HUB-2026-0143');
    expect(store.getCase('HUB-2026-0143').messages[0]?.text).toBe(
      'Raz w miesiącu kino w świetlicy.',
    );
  });

  it('numbers anonymous ideas too, without listing them for anyone', (): void => {
    const store: Store = createStore(fixedNow);
    store.submitIdea(idea, null);
    expect(store.listMyCases('maria')).toHaveLength(2);
    expect(store.getCase('HUB-2026-0143').authorId).toBeNull();
  });

  it('marks a case answered and notifies the author when the curator replies', (): void => {
    const store: Store = createStore(fixedNow);
    store.submitIdea(idea, 'maria');
    const before: number = store.listNotifications('maria').length;
    const thread: CaseThread = store.sendMessage(
      'HUB-2026-0143',
      'anna',
      'Dziękujemy za pomysł.',
    );
    expect(thread.status).toBe('Odpowiedziano');
    expect(thread.timeline.answered).toBe('14.10');
    expect(thread.messages.at(-1)).toMatchObject({
      from: 'anna',
      role: 'ROPS',
      time: '14.10, 09:30',
      text: 'Dziękujemy za pomysł.',
    });
    const after: readonly Notification[] = store.listNotifications('maria');
    expect(after).toHaveLength(before + 1);
    expect(after[0]).toMatchObject({
      unread: true,
      caseId: 'HUB-2026-0143',
      text: 'ROPS odpowiedział na Twój pomysł »Wiejski klub filmowy«',
    });
  });

  it('creates no notification when the author writes', (): void => {
    const store: Store = createStore(fixedNow);
    const before: number = store.listNotifications('maria').length;
    const thread: CaseThread = store.sendMessage(
      'HUB-2026-0142',
      'maria',
      'Mamy zgodę OSP.',
    );
    expect(thread.status).toBe('Odpowiedziano');
    expect(store.listNotifications('maria')).toHaveLength(before);
    expect(store.listNotifications('anna')).toHaveLength(0);
  });

  it('queues notifications until the author subscribes, then delivers live', (): void => {
    const store: Store = createStore(fixedNow);
    const received: string[] = [];
    store.sendMessage('HUB-2026-0142', 'anna', 'Pierwsza.');
    const unsubscribe: () => void = store.subscribe(
      'maria',
      (notification: Notification): void => {
        received.push(notification.id);
      },
    );
    expect(received).toHaveLength(1);
    store.sendMessage('HUB-2026-0142', 'anna', 'Druga.');
    expect(received).toHaveLength(2);
    unsubscribe();
    store.sendMessage('HUB-2026-0142', 'anna', 'Trzecia.');
    expect(received).toHaveLength(2);
  });

  it('marks all notifications read', (): void => {
    const store: Store = createStore(fixedNow);
    store.markAllRead('maria');
    expect(
      store
        .listNotifications('maria')
        .every((item: Notification): boolean => !item.unread),
    ).toBe(true);
  });

  it('throws for an unknown case', (): void => {
    const store: Store = createStore(fixedNow);
    expect((): CaseThread => store.getCase('HUB-0000')).toThrow(
      'Nie znaleziono zgłoszenia.',
    );
  });
});
