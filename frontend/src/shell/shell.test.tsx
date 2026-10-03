import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { HubApi } from '../api/HubApi';
import { createMockApi } from '../api/mock/createMockApi';
import type { Notification, PersonaId } from '../api/types';
import { STUB_MESSAGE } from '../app/contexts';
import { renderApp } from '../test/renderApp';

const EMPTY_TITLE: string = 'Nie masz jeszcze powiadomień';

describe('shell', (): void => {
  it('shows a visitor the brand, the navigation and a sign-in button', (): void => {
    renderApp('/nabory');
    expect(screen.getByText('HubMe')).toBeInTheDocument();
    const nav: HTMLElement = screen.getByRole('navigation', { name: 'Główna' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
    expect(within(nav).getByRole('link', { name: 'Nabory' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('button', { name: 'Zaloguj się' }),
    ).toBeInTheDocument();
  });

  it('renders a placeholder page for an undesigned section', (): void => {
    renderApp('/nabory');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nabory' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ta część nie jest dostępna w wersji demonstracyjnej.'),
    ).toBeInTheDocument();
  });

  it('signs in through the persona picker and shows the unread badge', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    const picker: HTMLElement = screen.getByRole('dialog', {
      name: 'Wybierz osobę',
    });
    await user.click(within(picker).getByRole('button', { name: /Maria N\./ }));
    expect(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Konto: Maria N.' }),
    ).toHaveTextContent('MN');
  });

  it('lists notifications and marks them read', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    await user.click(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    );
    const popover: HTMLElement = screen.getByRole('dialog', {
      name: 'Powiadomienia',
    });
    expect(within(popover).getAllByRole('listitem')).toHaveLength(4);
    await user.click(
      within(popover).getByRole('button', { name: 'Oznacz jako przeczytane' }),
    );
    expect(
      await within(popover).findByText('· 0 nieprzeczytane'),
    ).toBeInTheDocument();
  });

  it('keeps the list while it reloads after marking it read', async (): Promise<void> => {
    const { user } = renderApp('/nabory', {
      api: createMockApi({ delayMs: 30 }),
      persona: 'maria',
    });
    await user.click(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    );
    const popover: HTMLElement = screen.getByRole('dialog', {
      name: 'Powiadomienia',
    });
    let sawEmpty: boolean = false;
    const observer: MutationObserver = new MutationObserver((): void => {
      sawEmpty = sawEmpty || within(popover).queryByText(EMPTY_TITLE) !== null;
    });
    observer.observe(popover, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    await user.click(
      within(popover).getByRole('button', { name: 'Oznacz jako przeczytane' }),
    );
    // Optimistic: read at once, before the API has answered.
    expect(within(popover).getByText('· 0 nieprzeczytane')).toBeInTheDocument();
    expect(within(popover).queryByText('Nowe')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Powiadomienia, 0 nieprzeczytane' }),
    ).toBeInTheDocument();
    // Long enough for the write and the reload that follows it.
    await act(async (): Promise<void> => {
      await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 150);
      });
    });
    observer.disconnect();
    expect(sawEmpty).toBe(false);
    expect(within(popover).getAllByRole('listitem')).toHaveLength(4);
    expect(within(popover).getByText('· 0 nieprzeczytane')).toBeInTheDocument();
  });

  it('shows a loading line, not the empty state, before the first load', async (): Promise<void> => {
    const base: HubApi = createMockApi({ delayMs: 0 });
    let release: () => void = (): void => undefined;
    const gate: Promise<void> = new Promise<void>(
      (resolve: () => void): void => {
        release = resolve;
      },
    );
    const api: HubApi = {
      ...base,
      listNotifications: async (
        persona: PersonaId,
        signal?: AbortSignal,
      ): Promise<readonly Notification[]> => {
        await gate;
        return base.listNotifications(persona, signal);
      },
    };
    const { user } = renderApp('/nabory', { api, persona: 'maria' });
    const bell: HTMLElement = screen.getByRole('button', {
      name: 'Powiadomienia, 0 nieprzeczytane',
    });
    expect(bell).toHaveTextContent('');
    await user.click(bell);
    const popover: HTMLElement = screen.getByRole('dialog', {
      name: 'Powiadomienia',
    });
    expect(within(popover).getByRole('status')).toHaveTextContent(
      'Wczytujemy powiadomienia…',
    );
    expect(within(popover).queryByText(EMPTY_TITLE)).not.toBeInTheDocument();
    release();
    expect(await within(popover).findAllByRole('listitem')).toHaveLength(4);
    expect(within(popover).queryByRole('status')).not.toBeInTheDocument();
  });

  it('restores the list and says so when marking read fails', async (): Promise<void> => {
    const base: HubApi = createMockApi({ delayMs: 0 });
    const api: HubApi = {
      ...base,
      markAllRead: (): Promise<never> => Promise.reject(new Error('offline')),
    };
    const { user } = renderApp('/nabory', { api, persona: 'maria' });
    await user.click(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Oznacz jako przeczytane' }),
    );
    expect(
      await screen.findByText('Nie udało się oznaczyć powiadomień.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    ).toBeInTheDocument();
  });

  it('shows the empty notifications state', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'anna' });
    await user.click(
      screen.getByRole('button', { name: 'Powiadomienia, 0 nieprzeczytane' }),
    );
    expect(
      await screen.findByText('Nie masz jeszcze powiadomień'),
    ).toBeInTheDocument();
  });

  it('signs out from the account menu', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    await user.click(screen.getByRole('button', { name: 'Konto: Maria N.' }));
    await user.click(screen.getByRole('menuitem', { name: 'Wyloguj' }));
    expect(
      screen.getByRole('button', { name: 'Zaloguj się' }),
    ).toBeInTheDocument();
  });

  it('returns to the start page when signing out of a guarded page', async (): Promise<void> => {
    const { user, router } = renderApp('/moje-sprawy', { persona: 'maria' });
    await user.click(screen.getByRole('button', { name: 'Konto: Maria N.' }));
    await user.click(screen.getByRole('menuitem', { name: 'Wyloguj' }));
    expect(
      await screen.findByRole('button', { name: 'Zaloguj się' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.queryByRole('dialog', { name: 'Wybierz osobę' }),
    ).not.toBeInTheDocument();
  });

  it('returns to the start page when signing out of the ROPS panel', async (): Promise<void> => {
    const { user, router } = renderApp('/rops/kolejka', { persona: 'anna' });
    await user.click(screen.getByRole('button', { name: 'Wyloguj' }));
    expect(
      await screen.findByRole('button', { name: 'Zaloguj się' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.queryByRole('dialog', { name: 'Wybierz osobę' }),
    ).not.toBeInTheDocument();
  });

  it('cycles the text size through three steps', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    const button: HTMLElement = screen.getByRole('button', {
      name: 'Powiększ tekst',
    });
    expect(document.documentElement.style.fontSize).toBe('100%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('115%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('130%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('answers a stubbed control with the demo notice', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    await user.click(screen.getByRole('switch', { name: 'Prosty język' }));
    expect(screen.getByText(STUB_MESSAGE)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByText(STUB_MESSAGE)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Zamknij' }),
    ).not.toBeInTheDocument();
  });

  it('asks for a curator before showing the ROPS panel', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka');
    const picker: HTMLElement = screen.getByRole('dialog', {
      name: 'Wybierz osobę',
    });
    expect(
      within(picker).queryByRole('button', { name: /Maria N\./ }),
    ).not.toBeInTheDocument();
    await user.click(
      within(picker).getByRole('button', { name: /Anna Kowalczyk/ }),
    );
    expect(await screen.findByText('Panel ROPS')).toBeInTheDocument();
  });

  it('treats a signed-in non-curator the same way', (): void => {
    renderApp('/rops/kolejka', { persona: 'maria' });
    expect(
      screen.getByRole('dialog', { name: 'Wybierz osobę' }),
    ).toBeInTheDocument();
  });

  it('returns to the start page when the picker is cancelled', async (): Promise<void> => {
    const { user, router } = renderApp('/rops/kolejka');
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(router.state.location.pathname).toBe('/');
  });

  it('closes the persona picker with Escape and focuses it on open', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    const picker: HTMLElement = screen.getByRole('dialog', {
      name: 'Wybierz osobę',
    });
    expect(picker).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: 'Wybierz osobę' }),
    ).not.toBeInTheDocument();
  });

  it('closes the notifications popover with Escape and restores focus', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    const bell: HTMLElement = await screen.findByRole('button', {
      name: 'Powiadomienia, 3 nieprzeczytane',
    });
    await user.click(bell);
    expect(
      screen.getByRole('dialog', { name: 'Powiadomienia' }),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: 'Powiadomienia' }),
    ).not.toBeInTheDocument();
    expect(bell).toHaveFocus();
  });

  it('closes the notifications popover on a click outside', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    await user.click(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    );
    await user.click(screen.getByRole('heading', { level: 1 }));
    expect(
      screen.queryByRole('dialog', { name: 'Powiadomienia' }),
    ).not.toBeInTheDocument();
  });

  it('returns to the start page when Escape dismisses the guard picker', async (): Promise<void> => {
    const { user, router } = renderApp('/rops/kolejka');
    await user.keyboard('{Escape}');
    expect(router.state.location.pathname).toBe('/');
  });
});

describe('toast', (): void => {
  afterEach((): void => {
    vi.useRealTimers();
  });

  it('disappears after 8 seconds, counted from the latest toast', (): void => {
    vi.useFakeTimers();
    renderApp('/nabory');
    const control: HTMLElement = screen.getByRole('switch', {
      name: 'Prosty język',
    });
    function advance(ms: number): void {
      act((): void => {
        vi.advanceTimersByTime(ms);
      });
    }

    fireEvent.click(control);
    expect(screen.getByText(STUB_MESSAGE)).toBeInTheDocument();
    advance(7999);
    expect(screen.getByText(STUB_MESSAGE)).toBeInTheDocument();
    advance(1);
    expect(screen.queryByText(STUB_MESSAGE)).not.toBeInTheDocument();

    fireEvent.click(control);
    advance(5000);
    // A second toast restarts the timer.
    fireEvent.click(control);
    advance(7999);
    expect(screen.getByText(STUB_MESSAGE)).toBeInTheDocument();
    advance(1);
    expect(screen.queryByText(STUB_MESSAGE)).not.toBeInTheDocument();
  });
});
