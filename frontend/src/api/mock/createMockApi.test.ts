import { describe, expect, it } from 'vitest';

import { EXAMPLE_DESCRIPTION } from '../examples';
import type { HubApi } from '../HubApi';
import type {
  DraftSection,
  InstitutionProfile,
  RedactionResult,
  Replacement,
} from '../types';
import { createMockApi } from './createMockApi';

const profile: InstitutionProfile = {
  municipality: 'Jodłowa Wola',
  audience: 'Seniorzy',
  recipients: 40,
  budget: '10–30 tys. zł',
  staff: 'Koordynator',
  resources: ['KGW'],
};

describe('createMockApi', (): void => {
  it('returns the five drawn replacements for the example description', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const result: RedactionResult =
      await api.redactDescription(EXAMPLE_DESCRIPTION);
    expect(
      result.replacements.map((item: Replacement): string => item.tag),
    ).toEqual(['OSOBA_A', 'MIEJSCOWOŚĆ', 'TELEFON', 'ZDROWIE', 'OSOBA_B']);
  });

  it('returns any other text unchanged with no replacements', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const result: RedactionResult = await api.redactDescription(
      'Brakuje świetlicy dla młodzieży.',
    );
    expect(result).toEqual({
      segments: [{ kind: 'text', text: 'Brakuje świetlicy dla młodzieży.' }],
      replacements: [],
    });
  });

  it('yields the six draft sections in order', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const headings: string[] = [];
    for await (const section of api.draftService(
      'telefony-zyczliwosci',
      profile,
    )) {
      const current: DraftSection = section;
      headings.push(current.heading);
    }
    expect(headings).toEqual([
      'Zakres usługi',
      'Odbiorcy',
      'Kadra',
      'Harmonogram',
      'Koszty (widełki na rok)',
      'Ryzyka',
    ]);
  });

  it('rejects an unknown innovation', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    await expect(api.getInnovation('nope')).rejects.toThrow(
      'Nie znaleziono innowacji.',
    );
  });

  it('rejects sending a message while offline and keeps the thread unchanged', async (): Promise<void> => {
    const api: HubApi = createMockApi({
      delayMs: 0,
      isOnline: (): boolean => false,
    });
    await expect(
      api.sendMessage('HUB-2026-0142', 'maria', 'Halo'),
    ).rejects.toThrow('Brak połączenia.');
    expect((await api.getCase('HUB-2026-0142')).messages).toHaveLength(3);
  });

  it('rejects when the signal is already aborted', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const controller: AbortController = new AbortController();
    controller.abort();
    await expect(api.getTrends(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('shares one store between calls', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    await api.sendMessage('HUB-2026-0142', 'anna', 'Odpowiedź.');
    expect((await api.listNotifications('maria'))[0]?.caseId).toBe(
      'HUB-2026-0142',
    );
  });
});
