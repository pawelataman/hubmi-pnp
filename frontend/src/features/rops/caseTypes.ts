import type { CaseType } from '../../api/types';

export const TYPE_ICONS: Readonly<Record<CaseType, string>> = {
  Potrzeba: '◆',
  Pomysł: '✦',
  Opinia: '★',
  'Do testów': '◎',
  Zapytanie: '?',
};
