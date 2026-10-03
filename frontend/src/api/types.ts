export type PersonaId = 'ewa' | 'maria' | 'anna' | 'beneficiary' | 'expert';
export type PersonaRole = 'user' | 'curator' | 'expert';

export type PersonType = 'beneficiary' | 'innovator' | 'institution' | 'expert';

export interface NeedsProfile {
  readonly personType: 'beneficiary';
  readonly displayName: string;
  readonly description: string;
  readonly municipality: string;
}

export type ExpertiseDomain =
  'senior-support' | 'digital-inclusion' | 'community' | 'service-design';

export interface ExpertProfile {
  readonly personType: 'expert';
  readonly displayName: string;
  readonly profession: string;
  readonly domain: ExpertiseDomain;
  readonly description: string;
}

export interface ExpertSearchRequest {
  readonly profile: ExpertProfile;
  readonly query: string;
}

export interface ExpertInnovationMatch {
  readonly innovationId: string;
  readonly name: string;
  readonly category: string;
  readonly summary: string;
  readonly reason: string;
  readonly contribution: string;
}

export type ExpertCommentKind = 'correction' | 'improvement' | 'idea';

export interface ExpertCommentDraft {
  readonly kind: ExpertCommentKind;
  readonly text: string;
}

export interface ExpertComment extends ExpertCommentDraft {
  readonly id: string;
  readonly innovationId: string;
  readonly authorName: string;
  readonly profession: string;
  readonly domain: ExpertiseDomain;
  readonly createdAt: string;
}

export interface Persona {
  readonly id: PersonaId;
  readonly name: string;
  readonly initials: string;
  readonly role: PersonaRole;
  readonly description: string;
  readonly threadRole: string;
}

// ── Matchmaking ──────────────────────────────────────────────
export interface Replacement {
  readonly id: string;
  readonly icon: string;
  readonly tag: string;
  readonly inlineLabel: string;
  readonly kind: string;
  readonly original: string;
  readonly restorable: boolean;
}

export type RedactionSegment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'replacement'; readonly replacementId: string };

export interface RedactionResult {
  readonly segments: readonly RedactionSegment[];
  readonly replacements: readonly Replacement[];
}

export interface ProblemInput {
  readonly audience: MatchmakingAudience;
  readonly description: string;
  readonly municipality: string;
  readonly onBehalf: boolean;
}

export type MatchmakingAudience = 'individual' | 'institution';

export interface ChipGroup {
  readonly id: string;
  readonly label: string;
  readonly chips: readonly string[];
}

export interface Question {
  readonly id: string;
  readonly title: string;
  readonly options: readonly string[];
  readonly suggested: string | null;
}

export interface ProblemCard {
  readonly audience: MatchmakingAudience;
  readonly summary: string;
  readonly groups: readonly ChipGroup[];
  readonly questions: readonly Question[];
}

export interface MatchRequest {
  readonly card: ProblemCard;
  readonly answers: Readonly<Record<string, string | null>>;
}

export type MatchBand = 'strong' | 'medium' | 'weak';

export interface FitTag {
  readonly label: string;
  readonly ok: boolean;
}

export interface MatchCard {
  readonly innovationId: string;
  readonly name: string;
  readonly category: string;
  readonly band: MatchBand;
  readonly fit: readonly FitTag[];
  readonly verified: string;
  readonly cost: string;
}

export interface SimilarProblem {
  readonly quote: string;
  readonly innovationId: string;
  readonly source: string;
}

export interface MatchResults {
  readonly searchTerms: readonly string[];
  readonly cards: readonly MatchCard[];
  readonly similar: readonly SimilarProblem[];
  readonly similarCount: number;
}

export interface ReasonSegment {
  readonly text: string;
  readonly highlight: boolean;
}

export interface StatRow {
  readonly who: string;
  readonly value: number;
  readonly primary: boolean;
}

export interface LocalStat {
  readonly label: string;
  readonly max: number;
  readonly rows: readonly StatRow[];
}

export interface LocalStats {
  readonly stats: readonly LocalStat[];
  readonly source: string;
}

// ── Innovation ───────────────────────────────────────────────
export interface LabelledValue {
  readonly label: string;
  readonly value: string;
}

export interface Review {
  readonly heading: string;
  readonly quote: string;
}

export type InnovationArea =
  | 'Seniorzy'
  | 'Niepełnosprawność'
  | 'Rodzina i opiekunowie'
  | 'Zdrowie psychiczne'
  | 'Społeczność lokalna';

export type InnovationKind = 'usługa' | 'metoda' | 'narzędzie';

/** Yearly cost: low up to 10 000 zł, mid up to 50 000 zł, high above. */
export type CostBand = 'low' | 'mid' | 'high';

/** What the library tile and its filters need. */
export interface InnovationSummary {
  readonly id: string;
  readonly name: string;
  readonly area: InnovationArea;
  readonly kind: InnovationKind;
  readonly summary: string;
  /** `MM.YYYY` */
  readonly verified: string;
  readonly cost: string;
  readonly costBand: CostBand;
  /** One decimal with a comma, e.g. `4,6`. */
  readonly rating: string;
  readonly reviewCount: number;
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
}

export interface Innovation extends InnovationSummary {
  readonly category: string;
  readonly author: string;
  readonly incubator: string;
  readonly testerNote: string;
  readonly facts: readonly LabelledValue[];
  readonly materials: readonly string[];
  readonly steps: readonly string[];
  readonly fundingProgrammes: readonly string[];
  readonly fundingNote: string;
  readonly reviews: readonly Review[];
}

// ── Adaptation ───────────────────────────────────────────────
export interface MunicipalityFacts {
  readonly title: string;
  readonly rows: readonly LabelledValue[];
  readonly source: string;
}

export interface InstitutionProfile {
  readonly municipality: string;
  readonly audience: string;
  readonly recipients: number;
  readonly budget: string;
  readonly staff: string;
  readonly resources: readonly string[];
}

export type ScheduleTone = 'prepare' | 'run' | 'review';

export interface ScheduleRow {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly tone: ScheduleTone;
}

export type DraftSection =
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'text';
      readonly text: string;
    }
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'schedule';
      readonly months: readonly string[];
      readonly rows: readonly ScheduleRow[];
    }
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'costs';
      readonly rows: readonly LabelledValue[];
      readonly total: string;
    };

// ── Ideas, cases, threads ────────────────────────────────────
export type IdeaStage =
  'Pomysł' | 'Prototyp' | 'Testowane w mikroskali' | 'Działa';

export interface IdeaForm {
  readonly name: string;
  readonly summary: string;
  readonly audience: string;
  readonly problem: string;
  readonly stage: IdeaStage;
  readonly email: string;
}

export type CaseType =
  'Potrzeba' | 'Pomysł' | 'Opinia' | 'Do testów' | 'Zapytanie';

export type CaseStatus =
  'Nowe' | 'W trakcie' | 'Odpowiedziano' | 'Ponad 48 h' | 'Zamknięte';

export interface SubmittedCase {
  readonly id: string;
  readonly title: string;
  readonly replyBy: string;
}

export interface CaseSummary {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly status: CaseStatus;
}

export interface Message {
  readonly id: string;
  readonly from: PersonaId | null;
  readonly authorName: string;
  readonly initials: string;
  readonly role: string;
  readonly time: string;
  readonly text: string;
}

export interface CaseTimeline {
  readonly sent: string;
  readonly inProgress: string | null;
  readonly answered: string | null;
  readonly closed: string | null;
}

export interface CaseThread {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly status: CaseStatus;
  readonly authorId: PersonaId | null;
  readonly area: string;
  readonly place: string;
  readonly stage: string | null;
  readonly expert: string | null;
  readonly timeline: CaseTimeline;
  readonly messages: readonly Message[];
}

export interface QueueRow {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly area: string;
  readonly place: string;
  readonly date: string;
  readonly status: CaseStatus;
  readonly expert: string | null;
  readonly flagged: boolean;
}

export interface QueueFilter {
  readonly type: CaseType | null;
}

export interface QueuePage {
  readonly rows: readonly QueueRow[];
  readonly total: number;
  readonly open: number;
  readonly fresh: number;
  readonly overdue: number;
}

export interface Notification {
  readonly id: string;
  readonly icon: string;
  readonly text: string;
  readonly type: string;
  readonly time: string;
  readonly unread: boolean;
  readonly caseId: string | null;
}

// ── Trends ───────────────────────────────────────────────────
export interface AreaTrend {
  readonly area: string;
  readonly values: readonly number[];
}

export interface DistrictTile {
  readonly name: string;
  readonly abbr: string;
  readonly row: number;
  readonly col: number;
  readonly value: number;
}

export interface Gap {
  readonly title: string;
  readonly count: number;
  readonly districts: number;
  readonly last: string;
}

export interface Trends {
  readonly months: readonly string[];
  readonly areas: readonly AreaTrend[];
  readonly districts: readonly DistrictTile[];
  readonly gaps: readonly Gap[];
}
