import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, View } from 'react-native';

import { ApiError } from '../api';
import { BiometricOffer } from '../components/auth/BiometricOffer';
import { RecognizedUser } from '../components/auth/RecognizedUser';
import { VersionFooter } from '../components/auth/VersionFooter';
import { BiometricScanner } from '../components/biometric/BiometricScanner';
import { AppText } from '../components/common/AppText';
import { GradientButton } from '../components/common/GradientButton';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AuthTextField } from '../components/login/AuthTextField';
import { BrandHeader } from '../components/login/BrandHeader';
import { useAuth } from '../context/AuthContext';
import { useBiometricOffer } from '../hooks/useBiometricOffer';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';
import { biometricErrorMessage } from '../security/biometricMessages';
import { BiometricAuthError } from '../security/biometricTypes';
import { colors } from '../theme';

/** Mismo patrón que exige el backend para el nombre de usuario (ver authValidators.ts de la API). */
const USERNAME_REGEX = /^[A-Za-z0-9._-]{4,}$/;
const MIN_PASSWORD_LENGTH = 4;

/**
 * Pantalla 1 — Login.
 * - Si este celular tiene el ingreso biométrico activo, muestra al paciente reconocido y
 *   pide su huella/rostro (con opción de usar la contraseña o "No soy yo").
 * - Si no, muestra usuario y contraseña (POST /api/v1/auth/login).
 * - Después del primer ingreso con contraseña, ofrece activar la biometría.
 */
export function LoginScreen({ navigation, route }: RootScreenProps<'Login'>) {
  const { s } = useResponsive();
  const { biometrics, login, loginWithBiometrics, forgetDevice } = useAuth();
  const { account, capability } = biometrics;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Mensaje de error devuelto por el servidor o por la biometría. */
  const [serverError, setServerError] = useState<string | null>(null);
  /** El paciente pidió entrar con contraseña aunque tenga biometría activa. */
  const [usePassword, setUsePassword] = useState(route.params?.usePassword ?? false);
  // Tras "Cerrar sesión" no se abre el diálogo de la huella solo: el paciente decide si entrar.
  const autoPrompted = useRef(route.params?.skipBiometricPrompt ?? false);

  const goToMain = useCallback(() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }), [navigation]);
  const offer = useBiometricOffer(goToMain);

  const showBiometric = Boolean(account) && capability.available && !usePassword;

  const switchToPassword = useCallback(
    (message: string | null = null) => {
      setUsePassword(true);
      setServerError(message);
      if (account) setUsername(account.username);
    },
    [account],
  );

  const handleBiometricLogin = useCallback(async () => {
    setServerError(null);
    setLoading(true);
    try {
      await loginWithBiometrics();
      goToMain();
    } catch (error) {
      if (error instanceof BiometricAuthError) {
        const message = biometricErrorMessage(error.reason, capability.label);
        // Bloqueo, credencial invalidada o revocada: hay que usar la contraseña.
        if (['lockout', 'invalidated', 'revoked', 'unavailable'].includes(error.reason)) switchToPassword(message);
        else setServerError(message);
      } else {
        setServerError(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [capability.label, goToMain, loginWithBiometrics, switchToPassword]);

  // Si se llegó directo al formulario de contraseña, se deja escrito el usuario reconocido.
  useEffect(() => {
    if (usePassword && account) setUsername((current) => current || account.username);
  }, [account, usePassword]);

  // Al abrir la pantalla con biometría activa, se pide la huella una sola vez automáticamente.
  useEffect(() => {
    if (!biometrics.ready || !showBiometric || autoPrompted.current) return;
    autoPrompted.current = true;
    handleBiometricLogin();
  }, [biometrics.ready, handleBiometricLogin, showBiometric]);

  const handleNotMe = async () => {
    await forgetDevice();
    setUsername('');
    setPassword('');
    setUsePassword(true);
    setServerError(null);
  };

  const usernameInvalid = !USERNAME_REGEX.test(username.trim());
  const passwordInvalid = password.length < MIN_PASSWORD_LENGTH;

  const usernameError =
    submitted && usernameInvalid ? 'Usuario no válido. Usa letras, números, punto o guion (mín. 4).' : undefined;
  const passwordError =
    submitted && passwordInvalid ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined;

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const handlePasswordLogin = async () => {
    setSubmitted(true);
    setServerError(null);
    if (usernameInvalid || passwordInvalid) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      await offer.offerOrContinue(username.trim(), password);
      setPassword('');
    } catch (error) {
      // ApiError trae el mensaje que ya prepara el backend (401: credenciales, 429: bloqueo, 0: sin conexión...).
      const message = error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const notice = route.params?.notice;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScreenContainer scroll>
        <View style={[styles.content, { paddingHorizontal: s(28), paddingTop: s(48) }]}>
          <BrandHeader />

          {notice && !offer.visible ? (
            <View style={[styles.notice, { marginTop: s(24), padding: s(12) }]}>
              <AppText style={[styles.noticeText, { fontSize: s(11) }]} accessibilityLiveRegion="polite">
                {notice}
              </AppText>
            </View>
          ) : null}

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
          ) : showBiometric && account ? (
            <View style={[styles.biometric, { marginTop: s(40), gap: s(32) }]}>
              <RecognizedUser
                name={account.fullName}
                status={`Ingreso con ${capability.label} activo`}
                onNotMe={handleNotMe}
              />
              <BiometricScanner
                icon={capability.icon}
                caption={`Toca para ingresar con tu ${capability.label}`}
                onPress={handleBiometricLogin}
                disabled={loading}
              />
              {serverError ? (
                <AppText style={[styles.serverError, { fontSize: s(11) }]} accessibilityLiveRegion="polite">
                  {serverError}
                </AppText>
              ) : null}
              <Pressable onPress={() => switchToPassword()} hitSlop={12} accessibilityRole="button">
                <AppText weight="semibold" style={[styles.link, { fontSize: s(12) }]}>
                  Ingresar con contraseña
                </AppText>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.form, { marginTop: s(48), gap: s(18) }]}>
              <AuthTextField
                label="USUARIO"
                icon="person-outline"
                value={username}
                onChangeText={setUsername}
                placeholder="nombre.apellido"
                autoCapitalize="none"
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
                onSubmitEditing={canSubmit ? handlePasswordLogin : undefined}
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
                  onPress={handlePasswordLogin}
                  disabled={!canSubmit}
                  loading={loading}
                />
              </View>

              {account && capability.available ? (
                <Pressable
                  onPress={() => {
                    setUsePassword(false);
                    setServerError(null);
                  }}
                  hitSlop={12}
                  accessibilityRole="button"
                >
                  <AppText weight="semibold" style={[styles.link, { fontSize: s(12) }]}>
                    {`Ingresar con ${capability.label}`}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          )}

          <View style={styles.spacer} />

          {!offer.visible ? (
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
  biometric: { alignItems: 'center' },
  notice: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  noticeText: { color: colors.warning, textAlign: 'center' },
  serverError: { color: colors.danger, textAlign: 'center' },
  link: { color: colors.cyan, textAlign: 'center' },
  spacer: { flex: 1, minHeight: 16 },
  registerLink: { color: colors.textSecondary, textAlign: 'center' },
  registerLinkHighlight: { color: colors.cyan },
});
