'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface GlobalSearchContextValue {
  query: string;
  setQuery: (q: string) => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue>({
  query: '',
  setQuery: () => {},
});

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState('');

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const value = useMemo(() => ({ query, setQuery }), [query, setQuery]);

  return <GlobalSearchContext value={value}>{children}</GlobalSearchContext>;
}

export function useGlobalSearch() {
  return useContext(GlobalSearchContext);
}
