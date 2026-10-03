import type { StatusTone } from '../ui/StatusPill';
import type { CaseStatus } from './types';

export const STATUS_VIEW: Readonly<
  Record<CaseStatus, { readonly tone: StatusTone; readonly icon: string }>
> = {
  Nowe: { tone: 'new', icon: '●' },
  'W trakcie': { tone: 'progress', icon: '◐' },
  Odpowiedziano: { tone: 'done', icon: '↩' },
  'Ponad 48 h': { tone: 'alert', icon: '!' },
  Zamknięte: { tone: 'closed', icon: '○' },
};
