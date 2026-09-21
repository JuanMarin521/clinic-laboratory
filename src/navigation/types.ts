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
  Login: undefined;
  BiometricLogin: undefined;
  PinLogin: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;
