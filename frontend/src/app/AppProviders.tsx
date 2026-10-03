import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  EXAMPLE_DESCRIPTION,
  EXAMPLE_MUNICIPALITY,
  EXAMPLE_PROFILE,
} from '../api/examples';
import type { HubApi } from '../api/HubApi';
import { PERSONA_IDS, PERSONAS } from '../api/personas';
import type { Notification, PersonaId } from '../api/types';
import {
  AdaptationContext,
  ApiContext,
  MatchmakingContext,
  NotificationsContext,
  SessionContext,
  STUB_MESSAGE,
  TextSizeContext,
  ToastContext,
  useApi,
  useSession,
  useToast,
  type AdaptationState,
  type AdaptationValue,
  type MatchmakingState,
  type MatchmakingValue,
  type NotificationsValue,
  type SessionValue,
  type TextSizeValue,
  type ToastLink,
  type ToastMessage,
  type ToastValue,
} from './contexts';
import { useAsync, type AsyncResult } from './useAsync';

interface ChildrenProps {
  readonly children: ReactNode;
}

const PERSONA_KEY: string = 'hubme.persona';
const TEXT_SIZE_KEY: string = 'hubme.textSize';
const TEXT_SIZES: readonly number[] = [100, 115, 130];
const TOAST_MS: number = 8000;

function readStored(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Storage can be unavailable; the app still works for this page view.
  }
}

function readPersona(): PersonaId | null {
  const raw: string | null = readStored(PERSONA_KEY);
  return PERSONA_IDS.find((id: PersonaId): boolean => id === raw) ?? null;
}

function readTextSize(): number {
  const raw: number = Number(readStored(TEXT_SIZE_KEY));
  return TEXT_SIZES.includes(raw) ? raw : 100;
}

function SessionProvider({ children }: ChildrenProps): ReactElement {
  const [id, setId] = useState<PersonaId | null>(readPersona);
  const value: SessionValue = useMemo(
    (): SessionValue => ({
      persona: id === null ? null : PERSONAS[id],
      signIn: (next: PersonaId): void => {
        writeStored(PERSONA_KEY, next);
        setId(next);
      },
      signOut: (): void => {
        writeStored(PERSONA_KEY, null);
        setId(null);
      },
    }),
    [id],
  );
  return <SessionContext value={value}>{children}</SessionContext>;
}

function TextSizeProvider({ children }: ChildrenProps): ReactElement {
  const [percent, setPercent] = useState<number>(readTextSize);

  useEffect((): void => {
    document.documentElement.style.fontSize = `${String(percent)}%`;
    writeStored(TEXT_SIZE_KEY, String(percent));
  }, [percent]);

  const value: TextSizeValue = useMemo(
    (): TextSizeValue => ({
      percent,
      cycle: (): void => {
        setPercent((current: number): number => {
          const index: number = TEXT_SIZES.indexOf(current);
          return TEXT_SIZES[(index + 1) % TEXT_SIZES.length] ?? 100;
        });
      },
    }),
    [percent],
  );
  return <TextSizeContext value={value}>{children}</TextSizeContext>;
}

function ToastProvider({ children }: ChildrenProps): ReactElement {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId: number | null = toast?.id ?? null;

  useEffect((): (() => void) | undefined => {
    if (toastId === null) {
      return undefined;
    }
    const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
      setToast(null);
    }, TOAST_MS);
    return (): void => {
      clearTimeout(timer);
    };
  }, [toastId]);

  const value: ToastValue = useMemo((): ToastValue => {
    function show(text: string, link: ToastLink | null = null): void {
      setToast((previous: ToastMessage | null): ToastMessage => ({
        id: (previous?.id ?? 0) + 1,
        text,
        link,
      }));
    }
    return {
      toast,
      show,
      stub: (): void => {
        show(STUB_MESSAGE);
      },
      dismiss: (): void => {
        setToast(null);
      },
    };
  }, [toast]);
  return <ToastContext value={value}>{children}</ToastContext>;
}

function NotificationsProvider({ children }: ChildrenProps): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const { show } = useToast();
  const [version, setVersion] = useState<number>(0);
  const personaId: PersonaId | null = persona?.id ?? null;

  const { state }: AsyncResult<readonly Notification[]> = useAsync<
    readonly Notification[]
  >(
    `notifications:${personaId ?? 'none'}:${String(version)}`,
    (signal: AbortSignal): Promise<readonly Notification[]> =>
      personaId === null
        ? Promise.resolve([])
        : api.listNotifications(personaId, signal),
  );

  const announce: (notification: Notification) => void = useEffectEvent(
    (notification: Notification): void => {
      show(
        notification.text,
        notification.caseId === null
          ? null
          : {
              to: `/moje-sprawy/${notification.caseId}`,
              label: 'Otwórz wątek',
            },
      );
      setVersion((current: number): number => current + 1);
    },
  );

  useEffect((): (() => void) | undefined => {
    if (personaId === null) {
      return undefined;
    }
    return api.subscribeToNotifications(
      personaId,
      (notification: Notification): void => {
        announce(notification);
      },
    );
  }, [api, personaId]);

  const value: NotificationsValue = useMemo((): NotificationsValue => {
    const items: readonly Notification[] =
      state.status === 'ready' ? state.data : [];
    return {
      items,
      unread: items.filter((item: Notification): boolean => item.unread).length,
      markAllRead: (): void => {
        if (personaId === null) {
          return;
        }
        void api.markAllRead(personaId).then((): void => {
          setVersion((current: number): number => current + 1);
        });
      },
    };
  }, [api, state, personaId]);
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
}

const INITIAL_MATCHMAKING: MatchmakingState = {
  description: EXAMPLE_DESCRIPTION,
  municipality: EXAMPLE_MUNICIPALITY,
  onBehalf: true,
  submitted: false,
  restored: [],
  card: null,
  answers: {},
};

function MatchmakingProvider({ children }: ChildrenProps): ReactElement {
  const [state, setState] = useState<MatchmakingState>(INITIAL_MATCHMAKING);
  const value: MatchmakingValue = useMemo(
    (): MatchmakingValue => ({
      state,
      update: (patch: Partial<MatchmakingState>): void => {
        setState((current: MatchmakingState): MatchmakingState => ({
          ...current,
          ...patch,
        }));
      },
    }),
    [state],
  );
  return <MatchmakingContext value={value}>{children}</MatchmakingContext>;
}

const INITIAL_ADAPTATION: AdaptationState = {
  draft: EXAMPLE_PROFILE,
  submitted: false,
};

function AdaptationProvider({ children }: ChildrenProps): ReactElement {
  const [state, setState] = useState<AdaptationState>(INITIAL_ADAPTATION);
  const value: AdaptationValue = useMemo(
    (): AdaptationValue => ({
      state,
      update: (patch: Partial<AdaptationState>): void => {
        setState((current: AdaptationState): AdaptationState => ({
          ...current,
          ...patch,
        }));
      },
    }),
    [state],
  );
  return <AdaptationContext value={value}>{children}</AdaptationContext>;
}

interface AppProvidersProps {
  readonly api: HubApi;
  readonly children: ReactNode;
}

export function AppProviders({
  api,
  children,
}: AppProvidersProps): ReactElement {
  return (
    <ApiContext value={api}>
      <SessionProvider>
        <TextSizeProvider>
          <ToastProvider>
            <NotificationsProvider>
              <MatchmakingProvider>
                <AdaptationProvider>{children}</AdaptationProvider>
              </MatchmakingProvider>
            </NotificationsProvider>
          </ToastProvider>
        </TextSizeProvider>
      </SessionProvider>
    </ApiContext>
  );
}
