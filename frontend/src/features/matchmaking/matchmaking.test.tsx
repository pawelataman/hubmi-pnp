import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EXAMPLE_DESCRIPTION } from '../../api/examples';
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
