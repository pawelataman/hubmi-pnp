import type { ProfileDraft } from '../../api/examples';
import type { InstitutionProfile } from '../../api/types';
import type { StepItem } from '../../ui/Stepper';

/** Returns null when the recipient count is not a positive whole number. */
export function parseProfile(draft: ProfileDraft): InstitutionProfile | null {
  const raw: string = draft.recipients.trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    return null;
  }
  return {
    municipality: draft.municipality.trim(),
    audience: draft.audience.trim(),
    recipients: Number(raw),
    budget: draft.budget,
    staff: draft.staff.trim(),
    resources: draft.resources,
  };
}

export function profileSteps(draft: ProfileDraft): readonly StepItem[] {
  const groups: readonly (readonly [string, boolean])[] = [
    ['Gmina', draft.municipality.trim() !== ''],
    [
      'Odbiorcy',
      draft.audience.trim() !== '' && draft.recipients.trim() !== '',
    ],
    ['Budżet', draft.budget !== ''],
    ['Kadra', draft.staff.trim() !== ''],
    ['Zasoby', draft.resources.length > 0],
  ];
  const firstEmpty: number = groups.findIndex(
    ([, filled]: readonly [string, boolean]): boolean => !filled,
  );
  const current: number = firstEmpty === -1 ? groups.length - 1 : firstEmpty;
  return groups.map(
    ([label, filled]: readonly [string, boolean], index: number): StepItem => {
      const numbered: string = `${String(index + 1)}. ${label}`;
      if (index === current) {
        return { label: `${numbered} · teraz`, state: 'current' };
      }
      return { label: numbered, state: filled ? 'done' : 'todo' };
    },
  );
}
