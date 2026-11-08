import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { ApiError } from '../api';

export type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

/**
 * Carga datos del servidor para una pantalla y los mantiene al día:
 * - la primera vez muestra "cargando";
 * - cada vez que la pantalla vuelve a estar visible, recarga en silencio (sin parpadeo);
 * - `refresh` es para "deslizar hacia abajo para actualizar";
 * - `retry` vuelve a intentar después de un error.
 *
 * `load` debe estar memorizado (useCallback); si es `null` (ej. sin sesión) no se carga nada.
 * Con `enabled: false` no se carga hasta que pase a `true` (ej. una pestaña oculta).
 */
export function useRefreshableData<T>(
  load: (() => Promise<T>) | null,
  errorMessage: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [state, setState] = useState<RemoteState<T>>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const hasData = useRef(false);

  const run = useCallback(
    async (mode: 'initial' | 'silent' | 'pull') => {
      if (!load) return;
      if (mode === 'initial') setState({ status: 'loading' });
      if (mode === 'pull') setRefreshing(true);
      try {
        const data = await load();
        hasData.current = true;
        setState({ status: 'ready', data });
      } catch (error) {
        // En una recarga silenciosa que falla se conservan los datos que ya se mostraban.
        if (mode !== 'silent' || !hasData.current) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : errorMessage });
        }
      } finally {
        if (mode === 'pull') setRefreshing(false);
      }
    },
    [errorMessage, load],
  );

  useFocusEffect(
    useCallback(() => {
      if (enabled) run(hasData.current ? 'silent' : 'initial');
    }, [enabled, run]),
  );

  const refresh = useCallback(() => run('pull'), [run]);
  const retry = useCallback(() => run('initial'), [run]);

  return { state, refreshing, refresh, retry };
}
