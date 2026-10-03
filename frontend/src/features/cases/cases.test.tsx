import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EXAMPLE_IDEA } from '../../api/examples';
import { createMockApi } from '../../api/mock/createMockApi';
import { renderApp } from '../../test/renderApp';

function fixedNow(): Date {
  return new Date(2026, 9, 14, 9, 30);
}

describe('K1 idea form', (): void => {
  it('mirrors the form in the preview card', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl');
    const name: HTMLElement = screen.getByRole('textbox', {
      name: '1. Nazwa robocza',
    });
    await user.clear(name);
    await user.type(name, 'Klub filmowy');
    const preview: HTMLElement = screen.getByRole('region', {
      name: 'Podgląd fiszki',
    });
    expect(within(preview).getByText('Klub filmowy')).toBeInTheDocument();
    expect(
      screen.getByText(`${String(EXAMPLE_IDEA.summary.length)} / 160 znaków`),
    ).toBeInTheDocument();
  });

  it('shows field errors and does not send', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl');
    const name: HTMLElement = screen.getByRole('textbox', {
      name: '1. Nazwa robocza',
    });
    await user.clear(name);
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Podaj nazwę roboczą.');
    expect(name).toHaveFocus();
    expect(
      screen.queryByRole('heading', { name: 'Fiszka wysłana. Dziękujemy!' }),
    ).not.toBeInTheDocument();
  });

  it('sends the idea and shows the case number and reply date', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl', {
      api: createMockApi({ delayMs: 0, now: fixedNow }),
      persona: 'maria',
    });
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    const heading: HTMLElement = await screen.findByRole('heading', {
      level: 1,
      name: 'Fiszka wysłana. Dziękujemy!',
    });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveFocus();
    expect(screen.getByText('HUB-2026-0143')).toBeInTheDocument();
    expect(screen.getByText('21 października 2026')).toBeInTheDocument();
    await user.click(
      screen.getByRole('link', { name: 'Przejdź do Moich spraw' }),
    );
    // The seeded case and the one just sent share the example name.
    expect(
      await screen.findAllByRole('link', {
        name: 'Pomysł: Sąsiedzka kawiarenka',
      }),
    ).toHaveLength(2);
  });

  it('returns to a fresh form with focus on the first field', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl', {
      api: createMockApi({ delayMs: 0, now: fixedNow }),
      persona: 'maria',
    });
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    await user.click(
      await screen.findByRole('button', { name: 'Zgłoś kolejny pomysł' }),
    );
    expect(
      screen.getByRole('textbox', { name: '1. Nazwa robocza' }),
    ).toHaveFocus();
  });
});

describe('my cases and the author thread', (): void => {
  it('lists the persona cases with their status', async (): Promise<void> => {
    renderApp('/moje-sprawy', { persona: 'maria' });
    const items: HTMLElement[] = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Pomysł: Sąsiedzka kawiarenka');
    expect(items[0]).toHaveTextContent('Odpowiedziano');
  });

  it('shows the empty state to a curator', async (): Promise<void> => {
    renderApp('/moje-sprawy', { persona: 'anna' });
    expect(
      await screen.findByText('Nie masz jeszcze żadnych spraw.'),
    ).toBeInTheDocument();
  });

  it('shows the thread and appends a reply', async (): Promise<void> => {
    const { user } = renderApp('/moje-sprawy/HUB-2026-0142', {
      api: createMockApi({ delayMs: 0, now: fixedNow }),
      persona: 'maria',
    });
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzka kawiarenka',
      }),
    ).toBeInTheDocument();
    const messages: HTMLElement[] = screen.getAllByRole('article');
    expect(messages).toHaveLength(3);
    expect(messages[0]).toHaveTextContent('Ty');
    expect(messages[1]).toHaveTextContent('Anna Kowalczyk');

    const send: HTMLElement = screen.getByRole('button', { name: 'Wyślij' });
    expect(send).toBeDisabled();
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Twoja odpowiedź',
    });
    await user.type(field, 'Mamy zgodę OSP na czwartki.');
    await user.click(send);
    expect(await screen.findAllByRole('article')).toHaveLength(4);
    expect(screen.getByText('Mamy zgodę OSP na czwartki.')).toBeInTheDocument();
    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
  });

  it('keeps the draft and offers a retry when sending fails', async (): Promise<void> => {
    let online: boolean = false;
    const { user } = renderApp('/moje-sprawy/HUB-2026-0142', {
      api: createMockApi({ delayMs: 0, isOnline: (): boolean => online }),
      persona: 'maria',
    });
    const field: HTMLElement = await screen.findByRole('textbox', {
      name: 'Twoja odpowiedź',
    });
    await user.type(field, 'Dziękuję!');
    await user.click(screen.getByRole('button', { name: 'Wyślij' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie wysłano — brak połączenia. Tekst jest zapisany, spróbuj ponownie.',
    );
    expect(field).toHaveValue('Dziękuję!');
    online = true;
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(await screen.findAllByRole('article')).toHaveLength(4);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports an unknown case', async (): Promise<void> => {
    renderApp('/moje-sprawy/HUB-0000', { persona: 'maria' });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie znaleziono zgłoszenia.',
    );
  });
});
