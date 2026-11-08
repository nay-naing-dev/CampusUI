import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { errorMessage } from '@/lib/api';

type State<T> = { data: T | undefined; error: string | null; loading: boolean };

/**
 * Loads data when the screen comes into focus, so lists stay fresh after you
 * post, save or message elsewhere. `load` must be stable (wrap it in useCallback).
 * Earlier data stays on screen while it reloads.
 */
export function useApi<T>(load: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: undefined, error: null, loading: true });
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latest.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await load();
      if (request === latest.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (request === latest.current) setState((current) => ({ ...current, error: errorMessage(error), loading: false }));
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { ...state, reload, setData: (data: T) => setState((current) => ({ ...current, data })) };
}
