import { describe, expect, it } from 'vitest';

import { EXAMPLE_IDEA } from '../../api/examples';
import { validateIdea } from './validateIdea';

describe('validateIdea', (): void => {
  it('accepts the example idea', (): void => {
    expect(validateIdea(EXAMPLE_IDEA)).toEqual({});
  });

  it('accepts an empty e-mail', (): void => {
    expect(validateIdea({ ...EXAMPLE_IDEA, email: '' })).toEqual({});
  });

  it('requires the four text fields', (): void => {
    expect(
      validateIdea({
        ...EXAMPLE_IDEA,
        name: ' ',
        summary: '',
        audience: '',
        problem: '',
      }),
    ).toEqual({
      name: 'Podaj nazwę roboczą.',
      summary: 'Opisz pomysł w jednym zdaniu.',
      audience: 'Napisz, dla kogo jest pomysł.',
      problem: 'Napisz, jaki problem rozwiązuje.',
    });
  });

  it('limits the summary to 160 characters', (): void => {
    expect(validateIdea({ ...EXAMPLE_IDEA, summary: 'a'.repeat(161) })).toEqual(
      { summary: 'Skróć zdanie do 160 znaków.' },
    );
  });

  it('rejects a malformed e-mail', (): void => {
    expect(validateIdea({ ...EXAMPLE_IDEA, email: 'm.nowak@' })).toEqual({
      email: 'Sprawdź adres e-mail, np. imie@przyklad.pl.',
    });
  });
});
