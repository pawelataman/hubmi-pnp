import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STUB_MESSAGE } from '../app/contexts';
import { renderApp } from '../test/renderApp';

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
    expect(screen.getByRole('status')).toHaveTextContent(STUB_MESSAGE);
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
