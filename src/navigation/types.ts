import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Pestañas principales (barra inferior). */
export type MainTabParamList = {
  Results: undefined;
  ExamPdf: undefined;
  Attention: undefined;
};

/** Stack raíz: flujo de autenticación + app principal. */
export type RootStackParamList = {
  /**
   * `notice`: aviso opcional arriba del formulario (ej. sesión cerrada por inactividad).
   * `usePassword`: abre directamente el formulario de contraseña aunque haya biometría activa.
   * `skipBiometricPrompt`: muestra el ingreso biométrico pero sin abrir el diálogo solo (ej. tras cerrar sesión).
   */
  Login: { notice?: string; usePassword?: boolean; skipBiometricPrompt?: boolean } | undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  /** Perfil del paciente: se abre tocando el avatar del Inicio. */
  Profile: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;
