import { EXAMPLE_DESCRIPTION } from '../examples';
import type { HubApi } from '../HubApi';
import type {
  CaseSummary,
  CaseThread,
  DraftSection,
  IdeaForm,
  Innovation,
  InstitutionProfile,
  LocalStats,
  MatchResults,
  MunicipalityFacts,
  Notification,
  PersonaId,
  ProblemCard,
  ProblemInput,
  QueueFilter,
  QueuePage,
  ReasonSegment,
  RedactionResult,
  SubmittedCase,
  Trends,
} from '../types';
import { exampleDraft, exampleFacts } from './data/adaptation';
import { innovations } from './data/innovations';
import {
  exampleLocalStats,
  exampleMatches,
  exampleProblemCard,
  exampleReasons,
  exampleRedaction,
} from './data/matchmaking';
import { exampleTrends } from './data/trends';
import { createStore, type Store } from './store';

export interface MockApiOptions {
  /** Fixed delay per call. Omit for a random 600–1200 ms. */
  readonly delayMs?: number;
  readonly isOnline?: () => boolean;
  readonly now?: () => Date;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>(
    (resolve: () => void, reject: (reason: Error) => void): void => {
      if (signal?.aborted === true) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer: ReturnType<typeof setTimeout> = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        (): void => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    },
  );
}

export function createMockApi(options: MockApiOptions = {}): HubApi {
  const store: Store = createStore(options.now);
  const isOnline: () => boolean =
    options.isOnline ?? ((): boolean => navigator.onLine);

  function pause(signal?: AbortSignal, factor: number = 1): Promise<void> {
    const base: number = options.delayMs ?? 600 + Math.random() * 600;
    return wait(base * factor, signal);
  }

  return {
    async redactDescription(
      text: string,
      signal?: AbortSignal,
    ): Promise<RedactionResult> {
      await pause(signal);
      if (text.trim() === EXAMPLE_DESCRIPTION) {
        return exampleRedaction;
      }
      return { segments: [{ kind: 'text', text }], replacements: [] };
    },

    async summariseProblem(
      _input: ProblemInput,
      signal?: AbortSignal,
    ): Promise<ProblemCard> {
      await pause(signal);
      return exampleProblemCard;
    },

    async findMatches(
      _card: ProblemCard,
      signal?: AbortSignal,
    ): Promise<MatchResults> {
      await pause(signal);
      return exampleMatches;
    },

    async getMatchReason(
      innovationId: string,
      signal?: AbortSignal,
    ): Promise<readonly ReasonSegment[]> {
      const position: number =
        Object.keys(exampleReasons).indexOf(innovationId);
      await pause(signal, position + 1);
      return exampleReasons[innovationId] ?? [];
    },

    async getLocalStats(
      _municipality: string,
      signal?: AbortSignal,
    ): Promise<LocalStats> {
      await pause(signal);
      return exampleLocalStats;
    },

    async getInnovation(id: string, signal?: AbortSignal): Promise<Innovation> {
      await pause(signal);
      const found: Innovation | undefined = innovations[id];
      if (found === undefined) {
        throw new Error('Nie znaleziono innowacji.');
      }
      return found;
    },

    async getMunicipalityFacts(
      _municipality: string,
      signal?: AbortSignal,
    ): Promise<MunicipalityFacts> {
      await pause(signal);
      return exampleFacts;
    },

    async *draftService(
      _innovationId: string,
      _profile: InstitutionProfile,
      signal?: AbortSignal,
    ): AsyncGenerator<DraftSection> {
      for (const section of exampleDraft) {
        await pause(signal);
        yield section;
      }
    },

    async submitIdea(
      idea: IdeaForm,
      author: PersonaId | null,
      signal?: AbortSignal,
    ): Promise<SubmittedCase> {
      await pause(signal);
      return store.submitIdea(idea, author);
    },

    async listMyCases(
      persona: PersonaId,
      signal?: AbortSignal,
    ): Promise<readonly CaseSummary[]> {
      await pause(signal);
      return store.listMyCases(persona);
    },

    async getCase(id: string, signal?: AbortSignal): Promise<CaseThread> {
      await pause(signal);
      return store.getCase(id);
    },

    async sendMessage(
      caseId: string,
      from: PersonaId,
      text: string,
      signal?: AbortSignal,
    ): Promise<CaseThread> {
      await pause(signal);
      if (!isOnline()) {
        throw new Error('Brak połączenia.');
      }
      return store.sendMessage(caseId, from, text);
    },

    async listNotifications(
      persona: PersonaId,
      signal?: AbortSignal,
    ): Promise<readonly Notification[]> {
      await pause(signal);
      return store.listNotifications(persona);
    },

    async markAllRead(persona: PersonaId, signal?: AbortSignal): Promise<void> {
      await pause(signal);
      store.markAllRead(persona);
    },

    subscribeToNotifications(
      persona: PersonaId,
      onNew: (notification: Notification) => void,
    ): () => void {
      return store.subscribe(persona, onNew);
    },

    async listQueue(
      filter: QueueFilter,
      signal?: AbortSignal,
    ): Promise<QueuePage> {
      await pause(signal);
      return store.listQueue(filter);
    },

    async getTrends(signal?: AbortSignal): Promise<Trends> {
      await pause(signal);
      return exampleTrends;
    },
  };
}
