import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, View } from 'react-native';

import { ApiError } from '../api';
import { AppText } from '../components/common/AppText';
import { GradientButton } from '../components/common/GradientButton';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { VersionFooter } from '../components/auth/VersionFooter';
import { AuthTextField } from '../components/login/AuthTextField';
import { BrandHeader } from '../components/login/BrandHeader';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';
import { colors } from '../theme';

/** Mismo patrón que exige el backend para el nombre de usuario (ver authValidators.ts de la API). */
const USERNAME_REGEX = /^[A-Za-z0-9._-]{4,}$/;
const MIN_PASSWORD_LENGTH = 4;

/** Pantalla 1 — Login con usuario y contraseña, conectada a POST /api/v1/auth/login. */
export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const { s } = useResponsive();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Mensaje de error devuelto por el servidor (credenciales invalidas, sin conexión, etc.). */
  const [serverError, setServerError] = useState<string | null>(null);

  const usernameInvalid = !USERNAME_REGEX.test(username.trim());
  const passwordInvalid = password.length < MIN_PASSWORD_LENGTH;

  const usernameError =
    submitted && usernameInvalid ? 'Usuario no válido. Usa letras, números, punto o guion (mín. 4).' : undefined;
  const passwordError =
    submitted && passwordInvalid ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined;

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    setSubmitted(true);
    setServerError(null);
    if (usernameInvalid || passwordInvalid) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigation.navigate('BiometricLogin');
    } catch (error) {
      // ApiError trae el mensaje que ya prepara el backend (401: credenciales, 0: sin conexión, etc.).
      const message = error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScreenContainer scroll>
        <View style={[styles.content, { paddingHorizontal: s(28), paddingTop: s(48) }]}>
          <BrandHeader />

          <View style={[styles.form, { marginTop: s(48), gap: s(18) }]}>
            <AuthTextField
              label="USUARIO"
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              placeholder="NOMBRE.APELLIDO"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              editable={!loading}
              errorMessage={usernameError}
            />

            <AuthTextField
              label="CONTRASEÑA"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secure
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleLogin : undefined}
              editable={!loading}
              errorMessage={passwordError}
            />

            {serverError ? (
              <AppText style={[styles.serverError, { fontSize: s(11) }]} accessibilityLiveRegion="polite">
                {serverError}
              </AppText>
            ) : null}

            <View style={{ marginTop: s(4) }}>
              <GradientButton
                label="INICIAR SESIÓN"
                onPress={handleLogin}
                disabled={!canSubmit}
                loading={loading}
              />
            </View>
          </View>

          <View style={styles.spacer} />

          <Pressable
            onPress={() => navigation.navigate('Register')}
            hitSlop={12}
            accessibilityRole="button"
            style={{ paddingVertical: s(12) }}
          >
            <AppText style={[styles.registerLink, { fontSize: s(12) }]}>
              ¿No tienes cuenta? <AppText weight="semibold" style={styles.registerLinkHighlight}>Regístrate</AppText>
            </AppText>
          </Pressable>

          <View style={{ paddingVertical: s(16) }}>
            <VersionFooter />
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1 },
  form: { width: '100%' },
  serverError: { color: colors.danger, textAlign: 'center' },
  spacer: { flex: 1, minHeight: 16 },
  registerLink: { color: colors.textSecondary, textAlign: 'center' },
  registerLinkHighlight: { color: colors.cyan },
});
