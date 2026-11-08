import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Llama a `onTimeout` cuando la app vuelve al frente después de estar en segundo plano
 * al menos `timeoutMs`. Solo cuenta el estado "background" (salir de la app o apagar la
 * pantalla), no los diálogos del sistema como el de la huella.
 */
export function useInactivityTimeout(enabled: boolean, timeoutMs: number, onTimeout: () => void): void {
  const backgroundSince = useRef<number | null>(null);
  const callback = useRef(onTimeout);
  callback.current = onTimeout;

  useEffect(() => {
    if (!enabled) {
      backgroundSince.current = null;
      return;
    }

    const handleChange = (state: AppStateStatus) => {
      if (state === 'background') {
        backgroundSince.current ??= Date.now();
        return;
      }
      if (state === 'active' && backgroundSince.current !== null) {
        const elapsed = Date.now() - backgroundSince.current;
        backgroundSince.current = null;
        if (elapsed >= timeoutMs) callback.current();
      }
    };

    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, [enabled, timeoutMs]);
}
