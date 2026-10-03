import { useState } from 'react';
import {
  NavigationType,
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router';

import { parseQuery, toSearchParams, type LibraryQuery } from './libraryQuery';

export interface LibraryQueryState {
  readonly query: LibraryQuery;
  readonly setQuery: (next: LibraryQuery) => void;
}

/**
 * The library's filters, stored in the address. A change replaces the
 * history entry, so "back" from a card returns to the list as it was.
 *
 * The search text is also held in state: the address updates in a
 * transition and must not lag behind typing. The state follows the address
 * again whenever the location changes by a navigation other than our own
 * replace.
 */
export function useLibraryQuery(): LibraryQueryState {
  const [params, setParams] = useSearchParams();
  const location: ReturnType<typeof useLocation> = useLocation();
  const navigationType: NavigationType = useNavigationType();
  const stored: LibraryQuery = parseQuery(params);
  const [text, setText] = useState<string>(stored.text);
  const [entryKey, setEntryKey] = useState<string>(location.key);

  if (navigationType !== NavigationType.Replace && location.key !== entryKey) {
    setEntryKey(location.key);
    setText(stored.text);
  }

  function setQuery(next: LibraryQuery): void {
    setText(next.text);
    setParams(toSearchParams(next), {
      replace: true,
      preventScrollReset: true,
    });
  }

  return { query: { ...stored, text }, setQuery };
}
