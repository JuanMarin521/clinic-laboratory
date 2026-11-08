import { isRunningInExpoGo } from 'expo';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import type { BiometricCapability, BiometricKind } from './biometricTypes';

const UNAVAILABLE: BiometricCapability = {
  available: false,
  kind: 'generic',
  label: 'biometría',
  icon: 'finger-print',
  unavailableReason: 'not-configured',
};

function describe(kind: BiometricKind): Omit<BiometricCapability, 'available' | 'kind'> {
  switch (kind) {
    case 'fingerprint':
      return { label: Platform.OS === 'ios' ? 'Touch ID' : 'huella', icon: 'finger-print' };
    case 'face':
      return { label: Platform.OS === 'ios' ? 'Face ID' : 'reconocimiento facial', icon: 'scan-outline' };
    case 'iris':
      return { label: 'iris', icon: 'eye-outline' };
    default:
      return { label: 'biometría', icon: 'finger-print' };
  }
}

/** Elige el tipo de biometría a mostrar (si hay varias, se prefiere la huella). */
function pickKind(types: LocalAuthentication.AuthenticationType[]): BiometricKind {
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
  return 'generic';
}

/**
 * Revisa si el celular puede usar ingreso biométrico seguro.
 * Exige: sensor presente, biometría registrada y nivel FUERTE (BIOMETRIC_STRONG).
 * En iPhone con Face ID dentro de Expo Go responde "no disponible" (ver `unavailableReason`).
 * Nunca lanza error: ante cualquier problema responde "no disponible".
 */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  try {
    const [hasHardware, isEnrolled, level, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    const available =
      hasHardware && isEnrolled && level === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;
    if (!available) return UNAVAILABLE;

    const kind = pickKind(types);

    // Face ID no funciona dentro de Expo Go (le falta el permiso NSFaceIDUsageDescription).
    // No se ofrece, para no mostrar una opción que siempre fallaría.
    if (Platform.OS === 'ios' && kind === 'face' && isRunningInExpoGo()) {
      return { available: false, kind, ...describe(kind), unavailableReason: 'expo-go-face-id' };
    }

    return { available, kind, ...describe(kind) };
  } catch {
    return UNAVAILABLE;
  }
}
