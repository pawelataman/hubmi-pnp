import { EXAMPLE_DESCRIPTION } from '../examples';
import type { HubApi } from '../HubApi';
import type {
  ExpertComment,
  ExpertCommentDraft,
  ExpertInnovationMatch,
  ExpertProfile,
  ExpertSearchRequest,
  CaseSummary,
  CaseThread,
  DraftSection,
  IdeaForm,
  Innovation,
  InnovationSummary,
  InstitutionProfile,
  LocalStats,
  MatchResults,
  MatchRequest,
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
import { findExpertInnovations } from './data/expertMatchmaking';
import { addExpertComment, listExpertComments } from './expertComments';
import { innovations } from './data/innovations';
import {
  findIndividualMatches,
  individualReasons,
  summariseIndividualProblem,
} from './data/individualMatchmaking';
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

/** Picks the summary fields, so the list never leaks card content. */
function toSummary(innovation: Innovation): InnovationSummary {
  return {
    id: innovation.id,
    name: innovation.name,
    area: innovation.area,
    kind: innovation.kind,
    summary: innovation.summary,
    verified: innovation.verified,
    cost: innovation.cost,
    costBand: innovation.costBand,
    rating: innovation.rating,
    reviewCount: innovation.reviewCount,
    seeksTesters: innovation.seeksTesters,
    hasVideo: innovation.hasVideo,
  };
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
      input: ProblemInput,
      signal?: AbortSignal,
    ): Promise<ProblemCard> {
      await pause(signal);
      return input.audience === 'individual'
        ? summariseIndividualProblem(input)
        : exampleProblemCard;
    },

    async findMatches(
      request: MatchRequest,
      signal?: AbortSignal,
    ): Promise<MatchResults> {
      await pause(signal);
      return request.card.audience === 'individual'
        ? findIndividualMatches(request)
        : exampleMatches;
    },

    async getMatchReason(
      innovationId: string,
      card: ProblemCard,
      signal?: AbortSignal,
    ): Promise<readonly ReasonSegment[]> {
      const position: number =
        Object.keys(exampleReasons).indexOf(innovationId);
      await pause(signal, position + 1);
      const reasons: Readonly<Record<string, readonly ReasonSegment[]>> =
        card.audience === 'individual' ? individualReasons : exampleReasons;
      return reasons[innovationId] ?? [];
    },

    async getLocalStats(
      _municipality: string,
      signal?: AbortSignal,
    ): Promise<LocalStats> {
      await pause(signal);
      return exampleLocalStats;
    },

    async findExpertInnovations(
      request: ExpertSearchRequest,
      signal?: AbortSignal,
    ): Promise<readonly ExpertInnovationMatch[]> {
      await pause(signal);
      return findExpertInnovations(request);
    },

    async listExpertComments(
      innovationId: string,
      signal?: AbortSignal,
    ): Promise<readonly ExpertComment[]> {
      await pause(signal);
      if (innovations[innovationId] === undefined) {
        throw new Error('Nie znaleziono innowacji.');
      }
      return listExpertComments(innovationId);
    },

    async addExpertComment(
      innovationId: string,
      profile: ExpertProfile,
      draft: ExpertCommentDraft,
      signal?: AbortSignal,
    ): Promise<ExpertComment> {
      await pause(signal);
      if (innovations[innovationId] === undefined) {
        throw new Error('Nie znaleziono innowacji.');
      }
      return addExpertComment(
        innovationId,
        profile,
        draft,
        options.now?.() ?? new Date(),
      );
    },

    async listInnovations(
      signal?: AbortSignal,
    ): Promise<readonly InnovationSummary[]> {
      await pause(signal);
      return Object.values(innovations).map(toSummary);
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
