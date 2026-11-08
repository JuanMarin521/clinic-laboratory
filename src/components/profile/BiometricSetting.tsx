import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { biometricErrorMessage } from '../../security/biometricMessages';
import { BiometricAuthError } from '../../security/biometricTypes';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { GradientButton } from '../common/GradientButton';
import { AuthTextField } from '../login/AuthTextField';
import { FormMessage } from './FormMessage';

type Message = { type: 'success' | 'error'; text: string };

/**
 * Interruptor "Ingreso con huella" del Perfil (Seguridad).
 * - Activar: pide la contraseña (el servidor la confirma) y luego la huella/rostro.
 * - Desactivar: revoca la credencial en el servidor y la borra del celular.
 * `notice` permite que el Perfil muestre un aviso aquí (ej. tras cambiar la contraseña).
 */
export function BiometricSetting({ notice }: { notice?: string | null }) {
  const { s } = useResponsive();
  const { user, biometrics, enableBiometrics, disableBiometrics } = useAuth();
  const { capability, account } = biometrics;

  const [askingPassword, setAskingPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Un aviso nuevo desde el Perfil (ej. tras cambiar la contraseña) reemplaza al mensaje anterior.
  useEffect(() => {
    if (notice) setMessage({ type: 'success', text: notice });
  }, [notice]);

  const enabled = Boolean(user && account?.username === user.username);
  const label = capability.label;

  const closePasswordForm = () => {
    setAskingPassword(false);
    setPassword('');
  };

  const handleToggle = async (value: boolean) => {
    setMessage(null);
    if (value) {
      setAskingPassword(true);
      return;
    }
    setBusy(true);
    try {
      await disableBiometrics();
      setMessage({ type: 'success', text: `Ingreso con ${label} desactivado en este celular.` });
    } finally {
      setBusy(false);
    }
  };

  const handleEnable = async () => {
    if (!password) return;
    setBusy(true);
    setMessage(null);
    try {
      await enableBiometrics(password);
      closePasswordForm();
      setMessage({ type: 'success', text: `Listo. La próxima vez podrás ingresar con tu ${label}.` });
    } catch (error) {
      let text: string | null;
      if (error instanceof BiometricAuthError) text = biometricErrorMessage(error.reason, label);
      else text = error instanceof ApiError ? error.message : 'No se pudo activar el ingreso biométrico.';
      if (text) setMessage({ type: 'error', text });
    } finally {
      setBusy(false);
    }
  };

  const unavailableText =
    capability.unavailableReason === 'expo-go-face-id'
      ? 'Face ID no funciona en Expo Go. Estará disponible con la app instalada.'
      : 'Este celular no tiene biometría segura configurada.';

  const subtitle = !capability.available
    ? unavailableText
    : enabled
      ? 'Activo en este celular'
      : 'Entra sin escribir tu contraseña';

  return (
    <View style={{ gap: s(14) }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { width: s(34), height: s(34) }]}>
          <Ionicons name={capability.icon} size={s(17)} color={colors.textSecondary} />
        </View>
        <View style={styles.texts}>
          <AppText weight="medium" style={{ fontSize: s(13) }}>
            {`Ingreso con ${label}`}
          </AppText>
          <AppText style={[styles.muted, { fontSize: s(11) }]}>{subtitle}</AppText>
        </View>
        <Switch
          value={enabled || askingPassword}
          onValueChange={handleToggle}
          disabled={!capability.available || busy}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
          accessibilityLabel={`Ingreso con ${label}`}
        />
      </View>

      {askingPassword ? (
        <View style={{ gap: s(12) }}>
          <AuthTextField
            label="CONFIRMA TU CONTRASEÑA"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secure
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!busy}
          />
          <GradientButton
            label="ACTIVAR"
            onPress={handleEnable}
            disabled={!password}
            loading={busy}
            loadingLabel="ACTIVANDO ..."
          />
          <Pressable onPress={closePasswordForm} disabled={busy} accessibilityRole="button" hitSlop={10}>
            <AppText weight="medium" style={[styles.muted, styles.center, { fontSize: s(12) }]}>
              Cancelar
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {message ? <FormMessage type={message.type} text={message.text} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  muted: { color: colors.textSecondary },
  center: { textAlign: 'center' },
});
