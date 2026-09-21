import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { GradientButton } from '../components/common/GradientButton';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { VersionFooter } from '../components/auth/VersionFooter';
import { AuthTextField } from '../components/login/AuthTextField';
import { BrandHeader } from '../components/login/BrandHeader';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';

const USERNAME_REGEX = /^[A-Za-z0-9._-]{4,}$/;
const MIN_PASSWORD_LENGTH = 4;
const FAKE_LOGIN_DELAY_MS = 1500;

/** Pantalla 1 — Login con usuario y contraseña (sin backend: la validación es simulada). */
export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const { s } = useResponsive();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const usernameInvalid = !USERNAME_REGEX.test(username.trim());
  const passwordInvalid = password.length < MIN_PASSWORD_LENGTH;

  const usernameError =
    submitted && usernameInvalid ? 'Usuario no válido. Usa letras, números, punto o guion (mín. 4).' : undefined;
  const passwordError =
    submitted && passwordInvalid ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined;

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const handleLogin = () => {
    setSubmitted(true);
    if (usernameInvalid || passwordInvalid) return;

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      navigation.navigate('BiometricLogin');
    }, FAKE_LOGIN_DELAY_MS);
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

          <View style={{ paddingVertical: s(20) }}>
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
  spacer: { flex: 1, minHeight: 24 },
});
