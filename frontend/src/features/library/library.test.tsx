import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { HubApi } from '../../api/HubApi';
import { createMockApi } from '../../api/mock/createMockApi';
import type { InnovationSummary } from '../../api/types';
import { renderApp } from '../../test/renderApp';

async function tiles(): Promise<readonly HTMLElement[]> {
  const list: HTMLElement = await screen.findByRole('list', {
    name: 'Innowacje',
  });
  return within(list).getAllByRole('listitem');
}

function names(items: readonly HTMLElement[]): readonly string[] {
  return items.map(
    (tile: HTMLElement): string =>
      within(tile).getByRole('heading', { level: 2 }).textContent,
  );
}

function chip(group: string, name: RegExp): HTMLElement {
  return within(screen.getByRole('group', { name: group })).getByRole(
    'button',
    { name },
  );
}

describe('innovation library', (): void => {
  it('lists every innovation, newest verification first', async (): Promise<void> => {
    renderApp('/biblioteka');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Biblioteka innowacji' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Wczytujemy bibliotekę…')).toBeInTheDocument();
    const all: readonly HTMLElement[] = await tiles();
    expect(all).toHaveLength(12);
    expect(names(all).slice(0, 3)).toEqual([
      'Wytchnieniowa Sobota',
      'Sąsiedzkie Telefony Życzliwości',
      'Asystent na Godziny',
    ]);
    expect(screen.getByText('12 innowacji')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wyczyść filtry' }),
    ).not.toBeInTheDocument();
  });

  it('shows the catalogue fields on a tile', async (): Promise<void> => {
    renderApp('/biblioteka');
    const tile: HTMLElement | undefined = (await tiles())[1];
    expect(tile).toBeDefined();
    if (tile === undefined) {
      return;
    }
    expect(within(tile).getByText('Seniorzy · usługa')).toBeInTheDocument();
    expect(
      within(tile).getByText(
        'Wolontariusze codziennie dzwonią do samotnych seniorów i reagują, gdy coś ich niepokoi.',
      ),
    ).toBeInTheDocument();
    expect(
      within(tile).getByText('✓ Zweryfikowano 05.2026'),
    ).toBeInTheDocument();
    expect(
      within(tile).getByText('ok. 8–15 tys. zł / rok'),
    ).toBeInTheDocument();
    expect(within(tile).getByText('◎ Szuka testerów')).toBeInTheDocument();
    expect(within(tile).getByText('▶ Film')).toBeInTheDocument();
    expect(within(tile).getByText('★ 4,6 · 12 opinii')).toBeInTheDocument();
  });

  it('narrows the list with chips and keeps the filters in the address', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Obszar', /^Seniorzy · 3$/));
    expect(await screen.findByText('3 innowacje z 12')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?obszar=seniorzy');
    await user.click(chip('Typ', /^Metoda$/));
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Cyfrowy Wnuk']);
    expect(chip('Obszar', /^Zdrowie psychiczne · 0$/)).toBeInTheDocument();
    expect(chip('Obszar', /Seniorzy · 1$/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('filters by the feature toggles and cost', async (): Promise<void> => {
    const { user } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Cechy', /Szuka testerów/));
    expect(await screen.findByText('4 innowacje z 12')).toBeInTheDocument();
    await user.click(chip('Koszt roczny', /^do 10 tys\. zł$/));
    expect(await screen.findByText('2 innowacje z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Mapa Barier', 'Termometr Nastroju']);
  });

  it('searches without Polish diacritics', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.type(
      screen.getByRole('searchbox', { name: 'Szukaj w bibliotece' }),
      'zyczliwosci',
    );
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Sąsiedzkie Telefony Życzliwości']);
    expect(router.state.location.search).toBe('?q=zyczliwosci');
  });

  it('sorts the list', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sortuj' }),
      'Najlepiej oceniane',
    );
    expect(router.state.location.search).toBe('?sort=oceny');
    expect(names(await tiles()).slice(0, 5)).toEqual([
      'Wytchnieniowa Sobota',
      'Asystent na Godziny',
      'Sąsiedzkie Telefony Życzliwości',
      'Pierwsza Rozmowa',
      'Praca na Próbę',
    ]);
  });

  it('opens with the filters from the address', async (): Promise<void> => {
    renderApp('/biblioteka?koszt=ponad-50&sort=nazwa&q=&obszar=nieznany');
    expect(names(await tiles())).toEqual([
      'Asystent na Godziny',
      'Mobilna Kawiarenka Seniora',
      'Pierwsza Rozmowa',
    ]);
    expect(chip('Koszt roczny', /ponad 50 tys\. zł$/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('combobox', { name: 'Sortuj' })).toHaveValue(
      'name',
    );
  });

  it('explains an empty result and clears the filters, keeping the sort', async (): Promise<void> => {
    const { user, router } = renderApp(
      '/biblioteka?obszar=zdrowie-psychiczne&typ=metoda&sort=nazwa&q=x',
    );
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Żadna innowacja nie pasuje do tych filtrów',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 innowacji z 12')).toBeInTheDocument();
    const main: HTMLElement = screen.getByRole('main');
    expect(
      within(main).getByRole('link', { name: 'Zgłoś pomysł' }),
    ).toHaveAttribute('href', '/zglos-pomysl');
    await user.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));
    expect(await tiles()).toHaveLength(12);
    expect(router.state.location.search).toBe('?sort=nazwa');
    const search: HTMLElement = screen.getByRole('searchbox', {
      name: 'Szukaj w bibliotece',
    });
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });

  it('opens a card and comes back to the same filtered list', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Obszar', /^Zdrowie psychiczne · 2$/));
    expect(await screen.findByText('2 innowacje z 12')).toBeInTheDocument();
    await user.click(chip('Typ', /^Usługa$/));
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Pierwsza Rozmowa' }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Pierwsza Rozmowa',
      }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/innowacje/pierwsza-rozmowa');
    await router.navigate(-1);
    expect(names(await tiles())).toEqual(['Pierwsza Rozmowa']);
    expect(router.state.location.search).toBe(
      '?obszar=zdrowie-psychiczne&typ=usluga',
    );
  });

  it('offers a retry when the list fails to load', async (): Promise<void> => {
    const real: HubApi = createMockApi({ delayMs: 0 });
    let calls: number = 0;
    const api: HubApi = {
      ...real,
      listInnovations(
        signal?: AbortSignal,
      ): Promise<readonly InnovationSummary[]> {
        calls += 1;
        return calls === 1
          ? Promise.reject(new Error('Brak połączenia.'))
          : real.listInnovations(signal);
      },
    };
    const { user } = renderApp('/biblioteka?obszar=seniorzy', { api });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Brak połączenia.',
    );
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(await tiles()).toHaveLength(3);
  });
});
