import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EXAMPLE_DESCRIPTION } from '../../api/examples';
import type { HubApi } from '../../api/HubApi';
import { createMockApi } from '../../api/mock/createMockApi';
import type { ProblemCard, ReasonSegment } from '../../api/types';
import { renderApp } from '../../test/renderApp';

const OWN_TEXT: string =
  'W naszej wsi młodzież po lekcjach nie ma gdzie się spotykać, a świetlica jest zamknięta od roku.';

async function describeProblem(user: UserEvent, text: string): Promise<void> {
  const field: HTMLElement = screen.getByRole('textbox', {
    name: 'Opisz problem',
  });
  await user.clear(field);
  await user.type(field, text);
  await user.click(screen.getByRole('button', { name: 'Dalej →' }));
}

describe('M1 describe problem', (): void => {
  it('opens pre-filled with the example description', (): void => {
    renderApp('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Znajdź sprawdzone rozwiązanie problemu społecznego',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      EXAMPLE_DESCRIPTION,
    );
  });

  it('rejects a short description and keeps the text', async (): Promise<void> => {
    const { user, router } = renderApp('/');
    await describeProblem(user, 'Starsi ludzie są samotni.');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Opis jest za krótki. Dopisz 2–3 zdania: kogo dotyczy problem i co jest najtrudniejsze.',
    );
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Opisz problem',
    });
    expect(field).toHaveValue('Starsi ludzie są samotni.');
    expect(field).toHaveFocus();
    expect(router.state.location.pathname).toBe('/');
  });

  it('fills the description from an example', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(
      screen.getByRole('button', {
        name: '„Młodzież po szkole nie ma gdzie się spotykać”',
      }),
    );
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      'Młodzież po szkole nie ma gdzie się spotykać',
    );
  });
});

describe('M2 preview', (): void => {
  it('shows the five replacements for the example description', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tak zobaczy to system' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Zamiany (5)')).toBeInTheDocument();
    expect(screen.getByText('● OSOBA_A')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Usunęliśmy 5 informacji, które mogą identyfikować osobę. Do wyszukiwania nie są potrzebne.',
      ),
    ).toBeInTheDocument();
  });

  it('restores a replacement and removes it again', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    await user.click(
      await screen.findByRole('button', { name: 'Cofnij zamianę OSOBA_A' }),
    );
    expect(screen.getByText('Pani Janina')).toBeInTheDocument();
    expect(screen.queryByText('● OSOBA_A')).not.toBeInTheDocument();
    expect(screen.getByText(/^Usunęliśmy 4 informacje,/)).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Usuń ponownie OSOBA_A' }),
    );
    expect(screen.getByText('● OSOBA_A')).toBeInTheDocument();
  });

  it('never offers to restore health information', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    await screen.findByText('Zamiany (5)');
    expect(
      screen.queryByRole('button', { name: 'Cofnij zamianę ZDROWIE' }),
    ).not.toBeInTheDocument();
  });

  it('shows own text unchanged with nothing removed', async (): Promise<void> => {
    const { user } = renderApp('/');
    await describeProblem(user, OWN_TEXT);
    expect(
      await screen.findByText(
        'Nie znaleźliśmy informacji, które mogą identyfikować osobę.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(OWN_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(/^Zamiany/)).not.toBeInTheDocument();
  });

  it('goes back to editing with the text kept', async (): Promise<void> => {
    const { user } = renderApp('/');
    await describeProblem(user, OWN_TEXT);
    await user.click(screen.getByRole('link', { name: '← Wróć do edycji' }));
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      OWN_TEXT,
    );
  });

  it('redirects to the start when opened without a description', (): void => {
    const { router } = renderApp('/znajdz/podglad');
    expect(router.state.location.pathname).toBe('/');
  });
});

async function reachProblemCard(user: UserEvent): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Dalej →' }));
  await screen.findByText('Zamiany (5)');
  await user.click(
    screen.getByRole('button', { name: 'Akceptuję, szukaj dalej →' }),
  );
  await screen.findByRole('button', { name: 'Usuń samotność' });
}

describe('M3 problem card', (): void => {
  it('shows the AI summary, chips and suggested answers', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Sprawdź, czy dobrze rozumiemy',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sugestia AI, do weryfikacji')).toBeInTheDocument();
    const question: HTMLElement = screen.getByRole('group', {
      name: 'Kto miałby wdrażać?',
    });
    expect(
      within(question).getByRole('button', { name: 'Gmina z NGO' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('removes and adds chips', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(
      screen.getByRole('button', { name: 'Usuń brak transportu' }),
    );
    expect(screen.queryByText('brak transportu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dodaj: Problem' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nowy element: Problem' }),
      'brak opieki{Enter}',
    );
    expect(
      screen.getByRole('button', { name: 'Usuń brak opieki' }),
    ).toBeInTheDocument();
  });

  it('selects one answer per question and can skip', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    const question: HTMLElement = screen.getByRole('group', {
      name: 'Kto miałby wdrażać?',
    });
    await user.click(within(question).getByRole('button', { name: 'NGO' }));
    expect(
      within(question).getByRole('button', { name: 'NGO' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(question).getByRole('button', { name: 'Gmina z NGO' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await user.click(
      screen.getByRole('button', { name: 'Pomiń: Kto miałby wdrażać?' }),
    );
    expect(
      within(question).getByRole('button', { name: 'NGO' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('edits the summary in place', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(
      screen.getByRole('button', { name: 'Popraw streszczenie' }),
    );
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Streszczenie',
    });
    await user.clear(field);
    await user.type(field, 'seniorzy są samotni.');
    await user.click(
      screen.getByRole('button', { name: 'Zapisz streszczenie' }),
    );
    expect(screen.getByText(/seniorzy są samotni\./)).toBeInTheDocument();
  });
});

describe('M3 keyboard focus', (): void => {
  it('focuses the summary field, then returns focus to the edit button', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(
      screen.getByRole('button', { name: 'Popraw streszczenie' }),
    );
    expect(screen.getByRole('textbox', { name: 'Streszczenie' })).toHaveFocus();
    await user.click(
      screen.getByRole('button', { name: 'Zapisz streszczenie' }),
    );
    expect(
      screen.getByRole('button', { name: 'Popraw streszczenie' }),
    ).toHaveFocus();
  });

  it('returns focus to the add button after Enter and Escape', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(screen.getByRole('button', { name: 'Dodaj: Problem' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nowy element: Problem' }),
      'brak opieki{Enter}',
    );
    expect(
      screen.getByRole('button', { name: 'Dodaj: Problem' }),
    ).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Dodaj: Problem' }));
    expect(
      screen.getByRole('textbox', { name: 'Nowy element: Problem' }),
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(
      screen.getByRole('button', { name: 'Dodaj: Problem' }),
    ).toHaveFocus();
  });

  it('moves focus to a neighbouring chip or the add button on removal', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    // Problem group: samotność, brak transportu
    await user.click(screen.getByRole('button', { name: 'Usuń samotność' }));
    expect(
      screen.getByRole('button', { name: 'Usuń brak transportu' }),
    ).toHaveFocus();
    await user.click(
      screen.getByRole('button', { name: 'Usuń brak transportu' }),
    );
    expect(
      screen.getByRole('button', { name: 'Dodaj: Problem' }),
    ).toHaveFocus();
  });

  it('moves focus to the previous chip when the last one is removed', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(
      screen.getByRole('button', { name: 'Usuń brak transportu' }),
    );
    expect(
      screen.getByRole('button', { name: 'Usuń samotność' }),
    ).toHaveFocus();
  });
});

describe('M4 results', (): void => {
  async function reachResults(user: UserEvent): Promise<void> {
    await reachProblemCard(user);
    await user.click(
      screen.getByRole('button', { name: 'Szukaj rozwiązań →' }),
    );
    await screen.findByRole('heading', {
      level: 3,
      name: 'Sąsiedzkie Telefony Życzliwości',
    });
  }

  it('shows three matches with their reasons, similar problems and local stats', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Rozwiązania dla Twojego problemu',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(
      await screen.findByText(/Wolontariusze dzwonią codziennie/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Spotkania przyjeżdżają/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Młodzież uczy seniorów/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Starsze osoby we wsiach bez komunikacji publicznej/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Osoby 65+ mieszkające samotnie'),
    ).toBeInTheDocument();
  });

  it('announces once that the reasons are still arriving', async (): Promise<void> => {
    const base: HubApi = createMockApi({ delayMs: 0 });
    const release: (() => void)[] = [];
    const api: HubApi = {
      ...base,
      getMatchReason: async (
        innovationId: string,
        card: ProblemCard,
        signal?: AbortSignal,
      ): Promise<readonly ReasonSegment[]> => {
        await new Promise<void>((resolve: () => void): void => {
          release.push(resolve);
        });
        return base.getMatchReason(innovationId, card, signal);
      },
    };
    const { user } = renderApp('/', { api });
    await reachResults(user);
    const pending: string =
      'Mamy 3 innowacje. Uzasadnienia pojawiają się po kolei…';
    const note: HTMLElement = screen.getByText(pending);
    expect(note).toHaveAttribute('role', 'status');
    // One announcement for the list, none per card.
    for (const article of screen.getAllByRole('article')) {
      expect(within(article).queryByRole('status')).not.toBeInTheDocument();
    }
    expect(
      screen.getAllByText('Dlaczego pasuje — piszemy uzasadnienie…'),
    ).toHaveLength(3);

    release.slice(0, 2).forEach((resolve: () => void): void => {
      resolve();
    });
    expect(
      await screen.findByText(/Wolontariusze dzwonią codziennie/),
    ).toBeInTheDocument();
    expect(screen.getByText(pending)).toBeInTheDocument();

    release.slice(2).forEach((resolve: () => void): void => {
      resolve();
    });
    await waitFor((): void => {
      expect(screen.queryByText(pending)).not.toBeInTheDocument();
    });
    expect(
      screen.queryByText('Dlaczego pasuje — piszemy uzasadnienie…'),
    ).not.toBeInTheDocument();
  });

  it('keeps the feedback buttons mutually exclusive', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    const useful: HTMLElement = screen.getByRole('button', {
      name: 'Przydatne: Cyfrowy Wnuk',
    });
    const useless: HTMLElement = screen.getByRole('button', {
      name: 'Nieprzydatne: Cyfrowy Wnuk',
    });
    await user.click(useful);
    expect(useful).toHaveAttribute('aria-pressed', 'true');
    await user.click(useless);
    expect(useful).toHaveAttribute('aria-pressed', 'false');
    expect(useless).toHaveAttribute('aria-pressed', 'true');
  });

  it('redirects to the start when opened without a description', (): void => {
    const { router } = renderApp('/znajdz/wyniki');
    expect(router.state.location.pathname).toBe('/');
  });

  it('opens the innovation card and returns to the results', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    await user.click(
      screen.getByRole('link', {
        name: 'Zobacz szczegóły: Sąsiedzkie Telefony Życzliwości',
      }),
    );
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '← Wróć do wyników' }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Rozwiązania dla Twojego problemu',
      }),
    ).toBeInTheDocument();
  });
});
