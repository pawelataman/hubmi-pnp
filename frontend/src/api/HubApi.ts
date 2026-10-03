import type {
  CaseSummary,
  CaseThread,
  DraftSection,
  IdeaForm,
  Innovation,
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
} from './types';

export interface HubApi {
  redactDescription(
    text: string,
    signal?: AbortSignal,
  ): Promise<RedactionResult>;
  summariseProblem(
    input: ProblemInput,
    signal?: AbortSignal,
  ): Promise<ProblemCard>;
  findMatches(
    request: MatchRequest,
    signal?: AbortSignal,
  ): Promise<MatchResults>;
  getMatchReason(
    innovationId: string,
    card: ProblemCard,
    signal?: AbortSignal,
  ): Promise<readonly ReasonSegment[]>;
  getLocalStats(
    municipality: string,
    signal?: AbortSignal,
  ): Promise<LocalStats>;
  getInnovation(id: string, signal?: AbortSignal): Promise<Innovation>;
  getMunicipalityFacts(
    municipality: string,
    signal?: AbortSignal,
  ): Promise<MunicipalityFacts>;
  draftService(
    innovationId: string,
    profile: InstitutionProfile,
    signal?: AbortSignal,
  ): AsyncIterable<DraftSection>;
  submitIdea(
    idea: IdeaForm,
    author: PersonaId | null,
    signal?: AbortSignal,
  ): Promise<SubmittedCase>;
  listMyCases(
    persona: PersonaId,
    signal?: AbortSignal,
  ): Promise<readonly CaseSummary[]>;
  getCase(id: string, signal?: AbortSignal): Promise<CaseThread>;
  sendMessage(
    caseId: string,
    from: PersonaId,
    text: string,
    signal?: AbortSignal,
  ): Promise<CaseThread>;
  listNotifications(
    persona: PersonaId,
    signal?: AbortSignal,
  ): Promise<readonly Notification[]>;
  markAllRead(persona: PersonaId, signal?: AbortSignal): Promise<void>;
  /**
   * Calls `onNew` for every notification created for `persona` since their
   * last subscription ended, then for each new one. Returns an unsubscribe.
   */
  subscribeToNotifications(
    persona: PersonaId,
    onNew: (notification: Notification) => void,
  ): () => void;
  listQueue(filter: QueueFilter, signal?: AbortSignal): Promise<QueuePage>;
  getTrends(signal?: AbortSignal): Promise<Trends>;
}
