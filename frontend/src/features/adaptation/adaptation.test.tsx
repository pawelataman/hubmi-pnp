import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp';

const CARD: string = '/innowacje/telefony-zyczliwosci';

describe('Z2 innovation card', (): void => {
  it('shows the card and switches tabs', async (): Promise<void> => {
    const { user } = renderApp(CARD);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Co mówi źródło')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '← Wróć do wyników' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Opinie (12)' }));
    expect(screen.getByRole('tab', { name: 'Opinie (12)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByText('Co mówi źródło')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Ruszyliśmy w miesiąc\. Seniorzy czekają na telefon/),
    ).toBeInTheDocument();
  });

  it('shows tester and video chips only when they apply', async (): Promise<void> => {
    renderApp('/innowacje/mobilna-kawiarenka');
    await screen.findByRole('heading', {
      level: 1,
      name: 'Mobilna Kawiarenka Seniora',
    });
    expect(screen.queryByText('◎ Szuka testerów')).not.toBeInTheDocument();
    expect(screen.queryByText(/Zostało 6 miejsc/)).not.toBeInTheDocument();
  });

  it('reports an unknown innovation', async (): Promise<void> => {
    renderApp('/innowacje/nie-ma-takiej');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie znaleziono innowacji.',
    );
    expect(
      screen.getByRole('link', { name: 'Wróć na stronę główną' }),
    ).toHaveAttribute('href', '/');
  });
});

describe('adaptation', (): void => {
  it('asks to sign in, then drafts the service for the entered municipality', async (): Promise<void> => {
    const { user } = renderApp(CARD);
    await user.click(
      await screen.findByRole('link', { name: 'Dostosuj do mojej gminy' }),
    );
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Ewa W\./ },
      ),
    );
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Opowiedz nam o swojej instytucji',
      }),
    ).toBeInTheDocument();

    const municipality: HTMLElement = screen.getByRole('textbox', {
      name: 'Gmina',
    });
    await user.clear(municipality);
    await user.type(municipality, 'Lipnica');
    await user.click(
      within(
        screen.getByRole('group', { name: 'Zasoby i partnerzy' }),
      ).getByRole('button', { name: 'Transport' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości w gminie Lipnica',
      }),
    ).toBeInTheDocument();
    for (const heading of [
      'Zakres usługi',
      'Odbiorcy',
      'Kadra',
      'Harmonogram',
      'Koszty (widełki na rok)',
      'Ryzyka',
    ]) {
      expect(
        await screen.findByRole('heading', { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    const assumptions: HTMLElement = screen.getByRole('list', {
      name: 'Założenia, na których opiera się szkic',
    });
    expect(within(assumptions).getByText('Gmina Lipnica')).toBeInTheDocument();
    expect(within(assumptions).getByText('40 odbiorców')).toBeInTheDocument();
    expect(
      within(assumptions).queryByText('Brak własnego transportu'),
    ).not.toBeInTheDocument();
  });

  it('rejects a recipient count that is not a number', async (): Promise<void> => {
    const { user, router } = renderApp(`${CARD}/dostosuj`, { persona: 'ewa' });
    const recipients: HTMLElement = await screen.findByRole('textbox', {
      name: 'Szacowana liczba odbiorców',
    });
    await user.clear(recipients);
    await user.type(recipients, 'około czterdziestu');
    await user.click(
      screen.getByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Wpisz liczbę, np. 40. Wystarczy przybliżenie.',
    );
    expect(recipients).toHaveFocus();
    expect(router.state.location.pathname).toBe(`${CARD}/dostosuj`);
  });

  it('edits a draft section in place', async (): Promise<void> => {
    const { user } = renderApp(`${CARD}/dostosuj`, { persona: 'ewa' });
    await user.click(
      await screen.findByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Edytuj: Odbiorcy' }),
    );
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Treść: Odbiorcy',
    });
    expect(field).toHaveFocus();
    await user.clear(field);
    await user.type(field, 'Około 25 osób.');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(screen.getByText('Około 25 osób.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edytuj: Odbiorcy' }),
    ).toHaveFocus();
  });

  it('returns focus to the edit button when an edit is cancelled', async (): Promise<void> => {
    const { user } = renderApp(`${CARD}/dostosuj`, { persona: 'ewa' });
    await user.click(
      await screen.findByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Edytuj: Kadra' }),
    );
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(screen.getByRole('button', { name: 'Edytuj: Kadra' })).toHaveFocus();
    expect(
      screen.getByText(/Koordynator z GOPS \(1\/4 etatu\)/),
    ).toBeInTheDocument();
  });

  it('sends a visitor without a profile back to the profile form', async (): Promise<void> => {
    const { router } = renderApp(`${CARD}/szkic`, { persona: 'ewa' });
    await screen.findByRole('heading', {
      level: 1,
      name: 'Opowiedz nam o swojej instytucji',
    });
    expect(router.state.location.pathname).toBe(`${CARD}/dostosuj`);
  });
});
