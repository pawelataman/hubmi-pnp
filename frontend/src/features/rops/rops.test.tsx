import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp';

describe('A2 queue', (): void => {
  it('lists the example rows with the totals', async (): Promise<void> => {
    renderApp('/rops/kolejka', { persona: 'anna' });
    expect(
      await screen.findByText(
        '38 otwartych · 12 nowych · 4 bez odpowiedzi ponad 48 h',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(10);
    expect(
      screen.getByText('Wyniki 1–9 z 38 · dane przykładowe'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('⚑ Sprawdź redakcję — usunięto informacje o zdrowiu'),
    ).toHaveLength(3);
  });

  it('filters by type', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka', { persona: 'anna' });
    await screen.findByRole('link', { name: 'Wiejska biblioteka rzeczy' });
    await user.click(
      within(screen.getByRole('group', { name: 'Typ zgłoszenia' })).getByRole(
        'button',
        { name: 'Zapytanie do autora' },
      ),
    );
    expect(
      await screen.findByText('Wyniki 1–1 z 38 · dane przykładowe'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Koszty startu: Mobilna Kawiarenka Seniora',
      }),
    ).toBeInTheDocument();
  });

  it('selects rows and clears the selection', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka', { persona: 'anna' });
    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Zaznacz: Sąsiedzka kawiarenka',
      }),
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Zaznacz: Wiejska biblioteka rzeczy',
      }),
    );
    expect(screen.getByText('Zaznaczono 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Odznacz' }));
    expect(screen.queryByText(/^Zaznaczono/)).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('checkbox', { name: 'Zaznacz wszystkie' }),
    );
    expect(screen.getByText('Zaznaczono 9')).toBeInTheDocument();
  });
});

describe('A6 trends', (): void => {
  it('shows trends, districts and gaps', async (): Promise<void> => {
    renderApp('/rops/trendy', { persona: 'anna' });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Trendy potrzeb' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('↑ +89%')).toBeInTheDocument();
    expect(screen.getByText('↓ -31%')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Samotność, zgłoszenia w miesiącach IV–IX: 18, 21, 22, 26, 29, 34',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Kraków: 38')).toBeInTheDocument();
    expect(screen.getByText('pow. tarnowski')).toBeInTheDocument();
    expect(
      screen.getByText('9 zgłoszeń · 5 powiatów · ostatnie 02.10'),
    ).toBeInTheDocument();
  });
});

describe('idea to notification', (): void => {
  it('carries an idea to the curator and the reply back to the author', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl', { persona: 'maria' });

    // Step 4 of the demo: the author sends an idea.
    const name: HTMLElement = screen.getByRole('textbox', {
      name: '1. Nazwa robocza',
    });
    await user.clear(name);
    await user.type(name, 'Klub filmowy');
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    expect(await screen.findByText('HUB-2026-0143')).toBeInTheDocument();

    // Step 5: the curator finds it first in the queue and replies.
    await user.click(screen.getByRole('button', { name: 'Konto: Maria N.' }));
    await user.click(screen.getByRole('menuitem', { name: 'Zmień osobę' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Anna Kowalczyk/ },
      ),
    );
    await user.click(
      screen.getByRole('button', { name: 'Konto: Anna Kowalczyk' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Panel ROPS' }));
    const link: HTMLElement = await screen.findByRole('link', {
      name: 'Klub filmowy',
    });
    expect(screen.getAllByRole('row')[1]).toContainElement(link);
    expect(
      screen.getByText(
        '39 otwartych · 13 nowych · 4 bez odpowiedzi ponad 48 h',
      ),
    ).toBeInTheDocument();
    await user.click(link);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Klub filmowy' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    await user.type(
      screen.getByRole('textbox', { name: 'Odpowiedź do autorki' }),
      'Dziękujemy, odezwiemy się w tym tygodniu.',
    );
    await user.click(
      screen.getByRole('button', { name: 'Wyślij i powiadom autorkę' }),
    );
    expect(await screen.findAllByRole('article')).toHaveLength(2);
    expect(screen.getAllByRole('article')[1]).toHaveTextContent(
      'Ty (Anna Kowalczyk)',
    );

    // The author signs back in and is told about the reply.
    await user.click(screen.getByRole('button', { name: 'Zmień osobę' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Maria N\./ },
      ),
    );
    // The panel now asks for a curator; leaving it returns to the start page.
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'ROPS odpowiedział na Twój pomysł »Klub filmowy«',
    );
    expect(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 4 nieprzeczytane',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Otwórz wątek' }));
    expect(
      await screen.findByText('Dziękujemy, odezwiemy się w tym tygodniu.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Odpowiedziano/).length).toBeGreaterThan(0);
  });
});
