import { createContext, useContext, type Context } from 'react';

import type { ProfileDraft } from '../api/examples';
import type { HubApi } from '../api/HubApi';
import type {
  ExpertProfile,
  Notification,
  MatchmakingAudience,
  NeedsProfile,
  Persona,
  PersonaId,
  ProblemCard,
} from '../api/types';

function useRequired<T>(context: Context<T | null>): T {
  const value: T | null = useContext(context);
  if (value === null) {
    throw new Error('AppProviders is missing above this component.');
  }
  return value;
}

// ── API ──────────────────────────────────────────────────────
export const ApiContext: Context<HubApi | null> = createContext<HubApi | null>(
  null,
);
export function useApi(): HubApi {
  return useRequired(ApiContext);
}

// ── Session ──────────────────────────────────────────────────
export interface SessionValue {
  readonly persona: Persona | null;
  readonly needsProfile: NeedsProfile | null;
  readonly expertProfile: ExpertProfile | null;
  readonly expertProfileError: string | null;
  readonly saveExpertProfile: (profile: ExpertProfile) => void;
  readonly profileError: string | null;
  readonly saveNeedsProfile: (profile: NeedsProfile) => void;
  readonly signIn: (id: PersonaId) => void;
  readonly signOut: () => void;
}
export const SessionContext: Context<SessionValue | null> =
  createContext<SessionValue | null>(null);
export function useSession(): SessionValue {
  return useRequired(SessionContext);
}

// ── Text size ────────────────────────────────────────────────
export interface TextSizeValue {
  readonly percent: number;
  readonly cycle: () => void;
}
export const TextSizeContext: Context<TextSizeValue | null> =
  createContext<TextSizeValue | null>(null);
export function useTextSize(): TextSizeValue {
  return useRequired(TextSizeContext);
}

// ── Toast ────────────────────────────────────────────────────
export interface ToastLink {
  readonly to: string;
  readonly label: string;
}
export interface ToastMessage {
  readonly id: number;
  readonly text: string;
  readonly link: ToastLink | null;
}
export interface ToastValue {
  readonly toast: ToastMessage | null;
  readonly show: (text: string, link?: ToastLink | null) => void;
  readonly stub: () => void;
  readonly dismiss: () => void;
}
export const STUB_MESSAGE: string =
  'Ta funkcja nie jest dostępna w wersji demonstracyjnej.';
export const ToastContext: Context<ToastValue | null> =
  createContext<ToastValue | null>(null);
export function useToast(): ToastValue {
  return useRequired(ToastContext);
}

// ── Notifications ────────────────────────────────────────────
export interface NotificationsValue {
  readonly items: readonly Notification[];
  readonly unread: number;
  /** True only until the current persona's list has loaded for the first time. */
  readonly loading: boolean;
  readonly markAllRead: () => void;
}
export const NotificationsContext: Context<NotificationsValue | null> =
  createContext<NotificationsValue | null>(null);
export function useNotifications(): NotificationsValue {
  return useRequired(NotificationsContext);
}

// ── Matchmaking ──────────────────────────────────────────────
export interface MatchmakingState {
  readonly audience: MatchmakingAudience;
  readonly description: string;
  readonly municipality: string;
  readonly onBehalf: boolean;
  /** True once M1 was submitted; M2–M4 redirect to `/` while false. */
  readonly submitted: boolean;
  /** Ids of replacements the user restored on M2. */
  readonly restored: readonly string[];
  /** The card as edited on M3; null until M3 is confirmed. */
  readonly card: ProblemCard | null;
  readonly answers: Readonly<Record<string, string | null>>;
}
export interface MatchmakingValue {
  readonly state: MatchmakingState;
  readonly update: (patch: Partial<MatchmakingState>) => void;
}
export const MatchmakingContext: Context<MatchmakingValue | null> =
  createContext<MatchmakingValue | null>(null);
export function useMatchmaking(): MatchmakingValue {
  return useRequired(MatchmakingContext);
}

// ── Adaptation ───────────────────────────────────────────────
export interface AdaptationState {
  readonly draft: ProfileDraft;
  /** True once MW1 was submitted; MW2 redirects to MW1 while false. */
  readonly submitted: boolean;
}
export interface AdaptationValue {
  readonly state: AdaptationState;
  readonly update: (patch: Partial<AdaptationState>) => void;
}
export const AdaptationContext: Context<AdaptationValue | null> =
  createContext<AdaptationValue | null>(null);
export function useAdaptation(): AdaptationValue {
  return useRequired(AdaptationContext);
}
