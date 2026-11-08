import { useCallback, useRef, useState } from 'react';

import { ApiError } from '../api';
import { useAuth } from '../context/AuthContext';
import { biometricErrorMessage } from '../security/biometricMessages';
import { BiometricAuthError } from '../security/biometricTypes';

/**
 * Maneja la oferta "¿Activar ingreso con huella?" después de entrar con contraseña
 * (en el Login y en el Registro).
 *
 * La contraseña se necesita para que el servidor confirme la activación. Se guarda solo
 * en una referencia en memoria mientras la oferta está en pantalla y se borra al terminar.
 */
export function useBiometricOffer(onFinished: () => void) {
  const { biometrics, shouldOfferBiometrics, enableBiometrics, declineBiometricsOffer } = useAuth();
  const pending = useRef<{ username: string; password: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(() => {
    pending.current = null;
    setVisible(false);
    onFinished();
  }, [onFinished]);

  /** Llamar justo después de un ingreso con contraseña correcto. */
  const offerOrContinue = useCallback(
    async (username: string, password: string) => {
      if (await shouldOfferBiometrics(username)) {
        pending.current = { username, password };
        setError(null);
        setVisible(true);
      } else {
        onFinished();
      }
    },
    [onFinished, shouldOfferBiometrics],
  );

  const accept = useCallback(async () => {
    if (!pending.current) return;
    setLoading(true);
    setError(null);
    try {
      await enableBiometrics(pending.current.password);
      finish();
    } catch (err) {
      if (err instanceof BiometricAuthError) {
        setError(biometricErrorMessage(err.reason, biometrics.capability.label));
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo activar el ingreso biométrico.');
      }
    } finally {
      setLoading(false);
    }
  }, [biometrics.capability.label, enableBiometrics, finish]);

  const decline = useCallback(async () => {
    if (pending.current) await declineBiometricsOffer(pending.current.username);
    finish();
  }, [declineBiometricsOffer, finish]);

  return { visible, loading, error, capability: biometrics.capability, offerOrContinue, accept, decline };
}
