import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, View } from 'react-native';

import { ApiError } from '../api';
import { BiometricOffer } from '../components/auth/BiometricOffer';
import { PatientDataFields } from '../components/forms/PatientDataFields';
import { AppText } from '../components/common/AppText';
import { GradientButton } from '../components/common/GradientButton';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { VersionFooter } from '../components/auth/VersionFooter';
import { AuthTextField } from '../components/login/AuthTextField';
import { BrandHeader } from '../components/login/BrandHeader';
import { useAuth } from '../context/AuthContext';
import { useBiometricOffer } from '../hooks/useBiometricOffer';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';
import { colors } from '../theme';
import {
  EMPTY_PATIENT_DATA,
  trimPatientData,
  validatePatientData,
  type PatientData,
} from '../utils/patientValidation';

/** Mismas reglas que exige el backend (ver authValidators.ts de la API). */
const USERNAME_REGEX = /^[A-Za-z0-9._-]{4,}$/;
const MIN_FULL_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 4;

/**
 * Pantalla de registro — crea un paciente nuevo conectada a POST /api/v1/auth/register.
 * Pide los datos de acceso y los datos personales (todos obligatorios).
 */
export function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
  const { s } = useResponsive();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [patientData, setPatientData] = useState<PatientData>(EMPTY_PATIENT_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const goToMain = useCallback(() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }), [navigation]);
  // Al crear la cuenta ya queda la sesión iniciada: se ofrece activar la biometría igual que en el Login.
  const offer = useBiometricOffer(goToMain);

  const fullNameInvalid = fullName.trim().length < MIN_FULL_NAME_LENGTH;
  const usernameInvalid = !USERNAME_REGEX.test(username.trim());
  const passwordInvalid = password.length < MIN_PASSWORD_LENGTH;
  const patientErrors = validatePatientData(patientData, { required: true });

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
    if (fullNameInvalid || usernameInvalid || passwordInvalid || Object.keys(patientErrors).length > 0) {
      setServerError('Revisa los campos marcados en rojo.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        ...trimPatientData(patientData),
      });
      await offer.offerOrContinue(username.trim(), password);
      setPassword('');
    } catch (error) {
      // 409 si el usuario ya existe, 400 con `details` si el backend encuentra datos invalidos, etc.
      const message =
        error instanceof ApiError
          ? [error.message, ...error.details].join(' ')
          : 'No se pudo crear la cuenta. Intenta de nuevo.';
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

          {offer.visible ? (
            <View style={{ marginTop: s(40) }}>
              <BiometricOffer
                capability={offer.capability}
                loading={offer.loading}
                error={offer.error}
                onAccept={offer.accept}
                onDecline={offer.decline}
              />
            </View>
          ) : (
            <View style={[styles.form, { marginTop: s(40), gap: s(18) }]}>
              <AppText weight="medium" accessibilityRole="header" style={[styles.section, { fontSize: s(10) }]}>
                DATOS DE ACCESO
              </AppText>
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
                placeholder="nombre.apellido"
                autoCapitalize="none"
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
                returnKeyType="next"
                editable={!loading}
                errorMessage={passwordError}
              />

              <AppText weight="medium" accessibilityRole="header" style={[styles.section, { fontSize: s(10) }]}>
                DATOS PERSONALES
              </AppText>
              <PatientDataFields
                values={patientData}
                onChange={(field, value) => setPatientData((current) => ({ ...current, [field]: value }))}
                errors={submitted ? patientErrors : undefined}
                editable={!loading}
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
          )}

          <View style={styles.spacer} />

          {!offer.visible ? (
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
          ) : null}

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
  section: { color: colors.cyan, letterSpacing: 1.5, marginTop: 4 },
  serverError: { color: colors.danger, textAlign: 'center' },
  spacer: { flex: 1, minHeight: 16 },
  backToLogin: { color: colors.textSecondary, textAlign: 'center' },
  backToLoginHighlight: { color: colors.cyan },
});
