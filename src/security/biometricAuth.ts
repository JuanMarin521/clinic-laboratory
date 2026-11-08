import { Platform } from 'react-native';

import {
  ApiError,
  biometricLoginRequest,
  enrollBiometricRequest,
  revokeBiometricRequest,
  type BiometricLoginResponse,
} from '../api';
import { createGate, deleteGate, openGate } from './biometricGate';
import { BiometricAuthError, type EnrolledAccount } from './biometricTypes';
import { clearOfferDeclined, clearVault, readDeviceToken, saveDeviceToken, saveEnrolledAccount } from './biometricVault';

/**
 * Casos de uso del ingreso biométrico (sin React): une la puerta biométrica del celular,
 * el almacenamiento cifrado y la API. El `AuthContext` es el único que los llama.
 */

/** Nombre del dispositivo que se registra en el servidor (solo informativo). */
function deviceName(): string {
  if (Platform.OS === 'android') {
    const model = (Platform.constants as { Model?: string }).Model;
    return model ? `Android ${model}` : 'Android';
  }
  return Platform.OS === 'ios' ? 'iPhone / iPad' : Platform.OS;
}

/** Borra todo rastro local de la biometría (token, datos del paciente y la llave biométrica). */
async function wipeLocalEnrollment(): Promise<void> {
  await Promise.all([clearVault(), deleteGate()]);
}

/**
 * Activa el ingreso biométrico:
 * 0. Si el celular ya tenía una credencial (por ejemplo de otro paciente), se revoca primero:
 *    un celular tiene como máximo una credencial activa.
 * 1. Pide la biometría (y crea la llave protegida por hardware).
 * 2. El servidor confirma la contraseña y entrega el token del dispositivo.
 * 3. Se guarda cifrado. Si algo falla a mitad de camino, se deshace todo.
 */
export async function enrollBiometrics(
  sessionToken: string,
  password: string,
  account: EnrolledAccount,
  prompt: string,
): Promise<void> {
  await disableBiometrics('disabled');
  await createGate(prompt);

  let deviceToken: string | null = null;
  try {
    ({ deviceToken } = await enrollBiometricRequest(sessionToken, password, deviceName()));
    await saveDeviceToken(deviceToken);
    await saveEnrolledAccount(account);
    await clearOfferDeclined(account.username);
  } catch (error) {
    if (deviceToken) await revokeBiometricRequest(deviceToken, 'disabled').catch(() => undefined);
    await wipeLocalEnrollment();
    throw error;
  }
}

/**
 * Ingresa con biometría:
 * 1. Pide la huella/rostro (puerta biométrica). Sin eso, el token ni se lee.
 * 2. Envía el token al servidor y guarda el token NUEVO que devuelve (rotación).
 * Si la credencial ya no sirve (biometría cambiada o el servidor la rechaza), se borra.
 */
export async function loginWithBiometrics(prompt: string): Promise<BiometricLoginResponse> {
  try {
    await openGate(prompt);
  } catch (error) {
    if (error instanceof BiometricAuthError && error.reason === 'invalidated') await wipeLocalEnrollment();
    throw error;
  }

  const deviceToken = await readDeviceToken();
  if (!deviceToken) {
    await wipeLocalEnrollment();
    throw new BiometricAuthError('revoked');
  }

  try {
    const result = await biometricLoginRequest(deviceToken);
    await saveDeviceToken(result.deviceToken);
    return result;
  } catch (error) {
    // 401: vencida, revocada o reutilizada. La credencial local ya no sirve.
    if (error instanceof ApiError && error.status === 401) {
      await wipeLocalEnrollment();
      throw new BiometricAuthError('revoked', error.message);
    }
    throw error;
  }
}

/**
 * Desactiva el ingreso biométrico en este celular: avisa al servidor (si hay conexión)
 * y borra todo lo local. Lo local se borra SIEMPRE, aunque el servidor no responda.
 */
export async function disableBiometrics(reason: 'disabled' | 'logout'): Promise<void> {
  const deviceToken = await readDeviceToken().catch(() => null);
  if (deviceToken) await revokeBiometricRequest(deviceToken, reason).catch(() => undefined);
  await wipeLocalEnrollment();
}

/** Borra la credencial local sin avisar al servidor (cuando el servidor ya la revocó). */
export async function forgetLocalEnrollment(): Promise<void> {
  await wipeLocalEnrollment();
}
