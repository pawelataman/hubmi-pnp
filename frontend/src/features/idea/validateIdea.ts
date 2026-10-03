import type { IdeaForm } from '../../api/types';

export type IdeaField = 'name' | 'summary' | 'audience' | 'problem' | 'email';
export type IdeaErrors = Partial<Record<IdeaField, string>>;

export const SUMMARY_LIMIT: number = 160;

const EMAIL: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateIdea(form: IdeaForm): IdeaErrors {
  const errors: IdeaErrors = {};
  if (form.name.trim() === '') {
    errors.name = 'Podaj nazwę roboczą.';
  }
  if (form.summary.trim() === '') {
    errors.summary = 'Opisz pomysł w jednym zdaniu.';
  } else if (form.summary.trim().length > SUMMARY_LIMIT) {
    errors.summary = 'Skróć zdanie do 160 znaków.';
  }
  if (form.audience.trim() === '') {
    errors.audience = 'Napisz, dla kogo jest pomysł.';
  }
  if (form.problem.trim() === '') {
    errors.problem = 'Napisz, jaki problem rozwiązuje.';
  }
  if (form.email.trim() !== '' && !EMAIL.test(form.email.trim())) {
    errors.email = 'Sprawdź adres e-mail, np. imie@przyklad.pl.';
  }
  return errors;
}
