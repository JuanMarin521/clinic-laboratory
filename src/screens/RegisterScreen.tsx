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

/** Mismas reglas que exige el backend (ver authValidators.ts de la API). */
const USERNAME_REGEX = /^[A-Za-z0-9._-]{4,}$/;
const MIN_FULL_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 4;

/** Pantalla de registro — crea un paciente nuevo conectada a POST /api/v1/auth/register. */
export function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
  const { s } = useResponsive();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fullNameInvalid = fullName.trim().length < MIN_FULL_NAME_LENGTH;
  const usernameInvalid = !USERNAME_REGEX.test(username.trim());
  const passwordInvalid = password.length < MIN_PASSWORD_LENGTH;

  const fullNameError =
    submitted && fullNameInvalid ? `El nombre debe tener al menos ${MIN_FULL_NAME_LENGTH} caracteres.` : undefined;
  const usernameError =
    submitted && usernameInvalid ? 'Usuario no válido. Usa letras, números, punto o guion (mín. 4).' : undefined;
  const passwordError =
    submitted && passwordInvalid ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined;

  const canSubmit = fullName.trim().length > 0 && username.trim().length > 0 && password.length > 0;

  const handleRegister = async () => {
    setSubmitted(true);
    setServerError(null);
    if (fullNameInvalid || usernameInvalid || passwordInvalid) return;

    setLoading(true);
    try {
      await register(fullName.trim(), username.trim(), password);
      navigation.navigate('BiometricLogin');
    } catch (error) {
      // 409 si el usuario ya existe, 400 si el backend encuentra algo invalido, etc.
      const message = error instanceof ApiError ? error.message : 'No se pudo crear la cuenta. Intenta de nuevo.';
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

          <View style={[styles.form, { marginTop: s(40), gap: s(18) }]}>
            <AuthTextField
              label="NOMBRE COMPLETO"
              icon="person-circle-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="NOMBRE Y APELLIDO"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              editable={!loading}
              errorMessage={fullNameError}
            />

            <AuthTextField
              label="USUARIO"
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              placeholder="NOMBRE.APELLIDO"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="username-new"
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
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleRegister : undefined}
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
                label="CREAR CUENTA"
                onPress={handleRegister}
                disabled={!canSubmit}
                loading={loading}
                loadingLabel="CREANDO CUENTA ..."
              />
            </View>
          </View>

          <View style={styles.spacer} />

          <Pressable
            onPress={() => navigation.replace('Login')}
            hitSlop={12}
            accessibilityRole="button"
            style={{ paddingVertical: s(12) }}
          >
            <AppText style={[styles.backToLogin, { fontSize: s(12) }]}>
              ¿Ya tienes cuenta? <AppText weight="semibold" style={styles.backToLoginHighlight}>Inicia sesión</AppText>
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
  backToLogin: { color: colors.textSecondary, textAlign: 'center' },
  backToLoginHighlight: { color: colors.cyan },
});
