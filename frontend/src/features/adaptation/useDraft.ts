import { useEffect, useState } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { DraftSection, InstitutionProfile } from '../../api/types';
import { useApi } from '../../app/contexts';

export interface DraftState {
  readonly sections: readonly DraftSection[];
  readonly done: boolean;
  readonly failed: boolean;
}

interface Progress extends DraftState {
  readonly token: string;
}

const EMPTY: DraftState = { sections: [], done: false, failed: false };

/** Collects the draft sections as the API yields them. */
export function useDraft(
  innovationId: string,
  profile: InstitutionProfile | null,
): DraftState {
  const api: HubApi = useApi();
  const profileJson: string = JSON.stringify(profile);
  const token: string = `${innovationId}:${profileJson}`;
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect((): (() => void) => {
    const controller: AbortController = new AbortController();

    const runToken: string = `${innovationId}:${profileJson}`;

    async function run(target: InstitutionProfile): Promise<void> {
      const collected: DraftSection[] = [];
      try {
        for await (const section of api.draftService(
          innovationId,
          target,
          controller.signal,
        )) {
          if (controller.signal.aborted) {
            return;
          }
          collected.push(section);
          setProgress({
            token: runToken,
            sections: [...collected],
            done: false,
            failed: false,
          });
        }
        setProgress({
          token: runToken,
          sections: collected,
          done: true,
          failed: false,
        });
      } catch {
        if (!controller.signal.aborted) {
          setProgress({
            token: runToken,
            sections: collected,
            done: false,
            failed: true,
          });
        }
      }
    }

    const target: InstitutionProfile | null = JSON.parse(
      profileJson,
    ) as InstitutionProfile | null;
    if (target !== null) {
      void run(target);
    }
    return (): void => {
      controller.abort();
    };
  }, [api, innovationId, profileJson]);

  return progress !== null && progress.token === token ? progress : EMPTY;
}
