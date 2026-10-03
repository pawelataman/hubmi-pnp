import { describe, expect, it } from 'vitest';

import { EXAMPLE_PROFILE, type ProfileDraft } from '../../api/examples';
import type { StepItem } from '../../ui/Stepper';
import { parseProfile, profileSteps } from './profile';

describe('parseProfile', (): void => {
  it('turns a valid draft into a profile', (): void => {
    expect(parseProfile(EXAMPLE_PROFILE)).toEqual({
      municipality: 'Jodłowa Wola',
      audience: 'Seniorzy 65+ mieszkający samotnie',
      recipients: 40,
      budget: '10–30 tys. zł',
      staff: '1 pracownik socjalny na część etatu, asystent rodziny',
      resources: ['Lokal (świetlica)', 'KGW', 'OSP', 'Szkoła'],
    });
  });

  it.each(['około czterdziestu', '', '0', '-3', '4.5'])(
    'rejects %j as a recipient count',
    (recipients: string): void => {
      const draft: ProfileDraft = { ...EXAMPLE_PROFILE, recipients };
      expect(parseProfile(draft)).toBeNull();
    },
  );
});

describe('profileSteps', (): void => {
  it('marks the last step current when everything is filled', (): void => {
    expect(
      profileSteps(EXAMPLE_PROFILE).map((step: StepItem): string => step.state),
    ).toEqual(['done', 'done', 'done', 'done', 'current']);
  });

  it('marks the first empty group current and later ones todo', (): void => {
    const draft: ProfileDraft = { ...EXAMPLE_PROFILE, budget: '', staff: '' };
    expect(
      profileSteps(draft).map((step: StepItem): string => step.state),
    ).toEqual(['done', 'done', 'current', 'todo', 'done']);
  });
});
