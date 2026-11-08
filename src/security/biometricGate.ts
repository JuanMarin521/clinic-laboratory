import { isRunningInExpoGo } from 'expo';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { BiometricAuthError, type BiometricErrorReason } from './biometricTypes';

/**
 * "Puerta" biométrica: confirma que quien usa el celular es el dueño de la huella/rostro.
 *
 * Estrategia principal (Android, y iOS fuera de Expo Go): una llave del Keystore/Keychain
 * protegida por el hardware con `requireAuthentication`. Para leerla, el sistema exige
 * biometría FUERTE (sin PIN/patrón del celular como alternativa). Si cambian las huellas o
 * rostros registrados, el sistema invalida la llave y la lectura devuelve `null`: así se
 * detecta el cambio y se pide la contraseña otra vez.
 *
 * Estrategia de respaldo (solo iOS dentro de Expo Go, que no soporta `requireAuthentication`
 * con Face ID): el diálogo de `expo-local-authentication`, también sin alternativa de código.
 */

const GATE_KEY = 'cpo.biometric.gate';
const CANCEL_LABEL = 'Usar contraseña';

const hardwareBoundOptions = (prompt: string): SecureStore.SecureStoreOptions => ({
  requireAuthentication: true,
  authenticationPrompt: prompt,
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});

const usesHardwareBoundKey = Platform.OS === 'android' || !isRunningInExpoGo();

/**
 * Traduce los errores de `expo-local-authentication`. Se recibe como `string` porque en iOS
 * la librería también puede responder 'missing_usage_description' (falta el permiso de
 * Face ID, por ejemplo en Expo Go), que no está en su tipo `LocalAuthenticationError`.
 */
function fromLocalAuthError(error: LocalAuthentication.LocalAuthenticationError | string): BiometricErrorReason {
  switch (error) {
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
    case 'user_fallback':
      return 'cancelled';
    case 'lockout':
      return 'lockout';
    case 'not_enrolled':
    case 'not_available':
    case 'passcode_not_set':
    case 'missing_usage_description':
      return 'unavailable';
    default:
      return 'failed';
  }
}

/** Traduce los errores nativos de SecureStore (llegan como texto). */
function fromSecureStoreError(error: unknown): BiometricAuthError {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('cancel')) return new BiometricAuthError('cancelled');
  if (message.includes('lockout') || message.includes('too many')) return new BiometricAuthError('lockout');
  if (message.includes('no biometrics') || message.includes('no hardware') || message.includes('unsupported')) {
    return new BiometricAuthError('unavailable');
  }
  return new BiometricAuthError('failed');
}

/** Muestra el diálogo biométrico del sistema (sin alternativa de PIN/patrón del celular). */
async function promptBiometrics(prompt: string): Promise<void> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: CANCEL_LABEL,
    disableDeviceFallback: true,
    biometricsSecurityLevel: 'strong',
    fallbackLabel: '',
  });
  if (!result.success) throw new BiometricAuthError(fromLocalAuthError(result.error));
}

/**
 * Crea la puerta al activar el ingreso biométrico. Siempre pide la biometría una vez
 * (en Android la escritura de la llave ya la pide; en iOS se pide antes de guardar).
 */
export async function createGate(prompt: string): Promise<void> {
  if (!usesHardwareBoundKey) {
    await promptBiometrics(prompt);
    return;
  }

  if (Platform.OS === 'ios') await promptBiometrics(prompt);
  try {
    // El valor da igual: lo que importa es que solo se puede leer con biometría.
    await SecureStore.setItemAsync(GATE_KEY, `gate-${Date.now()}`, hardwareBoundOptions(prompt));
  } catch (error) {
    throw fromSecureStoreError(error);
  }
}

/** Pide la biometría para abrir la puerta. Lanza `BiometricAuthError` si no se pudo. */
export async function openGate(prompt: string): Promise<void> {
  if (!usesHardwareBoundKey) {
    await promptBiometrics(prompt);
    return;
  }

  let value: string | null;
  try {
    value = await SecureStore.getItemAsync(GATE_KEY, hardwareBoundOptions(prompt));
  } catch (error) {
    throw fromSecureStoreError(error);
  }
  // `null` = la llave fue invalidada (cambiaron las huellas/rostros) o ya no existe.
  if (value === null) throw new BiometricAuthError('invalidated');
}

/** Borra la puerta (al desactivar la biometría). No pide biometría. */
export async function deleteGate(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(GATE_KEY, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  } catch {
    // Si no existía, no hay nada que borrar.
  }
}
