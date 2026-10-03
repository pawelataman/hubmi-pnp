import {
  isExpertiseDomain,
  validateExpertProfile,
  type ExpertProfileValidation,
} from '../expertProfile';
import type {
  ExpertComment,
  ExpertCommentDraft,
  ExpertCommentKind,
  ExpertProfile,
} from '../types';

const COMMENTS_KEY: string = 'hubme.expertComments.v1';
export const MAX_EXPERT_COMMENT_LENGTH: number = 3000;
export const EXPERT_COMMENT_KINDS: Readonly<Record<ExpertCommentKind, string>> =
  {
    correction: 'Korekta',
    improvement: 'Sugestia usprawnienia',
    idea: 'Nowy pomysł',
  };

export function isExpertCommentKind(value: string): value is ExpertCommentKind {
  return Object.hasOwn(EXPERT_COMMENT_KINDS, value);
}

function decodeComment(
  value: unknown,
  innovationId: string,
): ExpertComment | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    value.id === '' ||
    !('innovationId' in value) ||
    value.innovationId !== innovationId ||
    !('authorName' in value) ||
    typeof value.authorName !== 'string' ||
    value.authorName.trim() === '' ||
    !('profession' in value) ||
    typeof value.profession !== 'string' ||
    !('domain' in value) ||
    typeof value.domain !== 'string' ||
    !isExpertiseDomain(value.domain) ||
    !('kind' in value) ||
    typeof value.kind !== 'string' ||
    !isExpertCommentKind(value.kind) ||
    !('text' in value) ||
    typeof value.text !== 'string' ||
    value.text.trim().length < 10 ||
    value.text.length > MAX_EXPERT_COMMENT_LENGTH ||
    !('createdAt' in value) ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt))
  ) {
    return null;
  }
  return {
    id: value.id,
    innovationId,
    authorName: value.authorName,
    profession: value.profession,
    domain: value.domain,
    kind: value.kind,
    text: value.text,
    createdAt: value.createdAt,
  };
}

export function listExpertComments(
  innovationId: string,
): readonly ExpertComment[] {
  try {
    const raw: string | null = window.localStorage.getItem(
      `${COMMENTS_KEY}.${innovationId}`,
    );
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Nieprawidłowy zapis komentarzy.');
    }
    const values: readonly unknown[] = parsed;
    return values.map((value: unknown): ExpertComment => {
      const comment: ExpertComment | null = decodeComment(value, innovationId);
      if (comment === null) {
        throw new Error('Nieprawidłowy zapis komentarzy.');
      }
      return comment;
    });
  } catch (error: unknown) {
    throw new Error(
      'Nie udało się odczytać komentarzy zapisanych w tej przeglądarce.',
      { cause: error },
    );
  }
}

export function addExpertComment(
  innovationId: string,
  profile: ExpertProfile,
  draft: ExpertCommentDraft,
  now: Date,
): ExpertComment {
  const validated: ExpertProfileValidation = validateExpertProfile(profile);
  if (!validated.valid) {
    throw new Error('Uzupełnij profil eksperta przed dodaniem komentarza.');
  }
  const text: string = draft.text.trim();
  if (
    !isExpertCommentKind(draft.kind) ||
    text.length < 10 ||
    text.length > MAX_EXPERT_COMMENT_LENGTH
  ) {
    throw new Error(
      'Komentarz powinien mieć od 10 do 3000 znaków i wybrany typ.',
    );
  }
  const comments: readonly ExpertComment[] = listExpertComments(innovationId);
  const comment: ExpertComment = {
    id: crypto.randomUUID(),
    innovationId,
    authorName: validated.profile.displayName,
    profession: validated.profile.profession,
    domain: validated.profile.domain,
    kind: draft.kind,
    text,
    createdAt: now.toISOString(),
  };
  try {
    window.localStorage.setItem(
      `${COMMENTS_KEY}.${innovationId}`,
      JSON.stringify([comment, ...comments]),
    );
  } catch (error: unknown) {
    throw new Error(
      'Nie udało się zapisać komentarza. Sprawdź ustawienia zapisywania danych w przeglądarce.',
      { cause: error },
    );
  }
  return comment;
}
