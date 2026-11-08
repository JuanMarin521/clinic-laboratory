import { useEffect, useRef } from 'react';

import { onSessionInvalid } from '../../api/sessionEvents';
import { useAuth } from '../../context/AuthContext';
import { navigationRef } from '../../navigation/AppNavigator';

const SESSION_EXPIRED_NOTICE = 'Tu sesión venció. Ingresa de nuevo.';

/**
 * Atiende la sesión vencida (401 SESSION_INVALID) en un solo lugar: cierra la sesión
 * y vuelve al login con un aviso. Si el paciente tiene biometría activa, el login le
 * pide la huella para entrar de nuevo. No dibuja nada.
 */
export function SessionGuard() {
  const { user, logout } = useAuth();
  const hasSession = useRef(false);
  hasSession.current = Boolean(user);

  useEffect(
    () =>
      onSessionInvalid(() => {
        // Varias peticiones pueden fallar a la vez: solo se reacciona una vez.
        if (!hasSession.current) return;
        hasSession.current = false;
        logout();
        if (navigationRef.isReady()) {
          navigationRef.reset({ index: 0, routes: [{ name: 'Login', params: { notice: SESSION_EXPIRED_NOTICE } }] });
        }
      }),
    [logout],
  );

  return null;
}
