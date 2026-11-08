import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ApiError } from '../../api';
import { INACTIVITY_LOCK_MS } from '../../constants/app';
import { useAuth } from '../../context/AuthContext';
import { useInactivityTimeout } from '../../hooks/useInactivityTimeout';
import { useResponsive } from '../../hooks/useResponsive';
import { navigationRef } from '../../navigation/AppNavigator';
import { biometricErrorMessage } from '../../security/biometricMessages';
import { BiometricAuthError } from '../../security/biometricTypes';
import { colors } from '../../theme';
import { BiometricScanner } from '../biometric/BiometricScanner';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';
import { ScreenContainer } from '../common/ScreenContainer';

const INACTIVITY_NOTICE = 'Por seguridad, cerramos tu sesión porque la app estuvo inactiva.';

/**
 * Bloqueo por inactividad. Si la app pasó INACTIVITY_LOCK_MS en segundo plano con la sesión
 * abierta, al volver:
 * - con biometría activa: tapa la app con esta pantalla y pide la huella/rostro. Al
 *   desbloquear, se vuelve exactamente a donde estaba el paciente (y con un token fresco);
 * - sin biometría: cierra la sesión y vuelve al login con un aviso.
 */
export function AppLockGate() {
  const { s } = useResponsive();
  const { user, biometrics, loginWithBiometrics, logout } = useAuth();
  const [locked, setLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBiometrics = Boolean(user && biometrics.capability.available && biometrics.account?.username === user.username);

  /** Vuelve al login sin desactivar la biometría (el paciente puede volver a usar su huella). */
  const endSession = useCallback(
    (notice: string) => {
      setLocked(false);
      logout();
      if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes: [{ name: 'Login', params: { notice, usePassword: true } }] });
    },
    [logout],
  );

  useInactivityTimeout(Boolean(user), INACTIVITY_LOCK_MS, () => {
    if (hasBiometrics) {
      setError(null);
      setLocked(true);
    } else {
      endSession(INACTIVITY_NOTICE);
    }
  });

  const unlock = useCallback(async () => {
    setVerifying(true);
    setError(null);
    try {
      await loginWithBiometrics();
      setLocked(false);
    } catch (err) {
      if (err instanceof BiometricAuthError) {
        const message = biometricErrorMessage(err.reason, biometrics.capability.label);
        if (err.reason === 'cancelled' || err.reason === 'failed') setError(message);
        else endSession(message ?? INACTIVITY_NOTICE);
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo verificar tu identidad.');
      }
    } finally {
      setVerifying(false);
    }
  }, [biometrics.capability.label, endSession, loginWithBiometrics]);

  if (!locked || !user) return null;

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <ScreenContainer>
        <View style={[styles.content, { paddingHorizontal: s(28), gap: s(28) }]}>
          <View style={[styles.header, { gap: s(8) }]}>
            <Avatar size={s(72)} />
            <AppText weight="semibold" style={{ fontSize: s(17) }}>
              {user.fullName}
            </AppText>
            <AppText style={[styles.muted, { fontSize: s(12) }]}>Tu sesión se bloqueó por inactividad</AppText>
          </View>

          <BiometricScanner
            icon={biometrics.capability.icon}
            caption={`Toca para desbloquear con tu ${biometrics.capability.label}`}
            onPress={unlock}
            disabled={verifying}
          />

          {error ? (
            <AppText accessibilityLiveRegion="polite" style={[styles.error, { fontSize: s(11) }]}>
              {error}
            </AppText>
          ) : null}

          <Pressable onPress={() => endSession('Ingresa con tu contraseña.')} hitSlop={12} accessibilityRole="button">
            <AppText weight="semibold" style={[styles.link, { fontSize: s(12) }]}>
              Usar contraseña
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center' },
  muted: { color: colors.textSecondary },
  error: { color: colors.danger, textAlign: 'center' },
  link: { color: colors.cyan },
});
