import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loginRequest, registerRequest, type AuthUser, type RegisterInput } from '../api';
import {
  disableBiometrics as disableBiometricsUseCase,
  enrollBiometrics,
  forgetLocalEnrollment,
  loginWithBiometrics as loginWithBiometricsUseCase,
} from '../security/biometricAuth';
import { getBiometricCapability } from '../security/biometricCapability';
import type { BiometricCapability, EnrolledAccount } from '../security/biometricTypes';
import { markOfferDeclined, readEnrolledAccount, wasOfferDeclined } from '../security/biometricVault';

/** Estado del ingreso biométrico en este celular. */
export interface BiometricState {
  /** `false` mientras se revisa el celular al abrir la app. */
  ready: boolean;
  capability: BiometricCapability;
  /** Paciente con biometría activa en este celular, o `null`. */
  account: EnrolledAccount | null;
}

interface AuthContextValue {
  /** Usuario autenticado actualmente, o `null` si nadie ha iniciado sesion. */
  user: AuthUser | null;
  /** Token JWT vigente, necesario para llamar a las rutas protegidas de la API. */
  token: string | null;
  biometrics: BiometricState;
  /** Llama a POST /auth/login y guarda el usuario/token si fue exitoso. */
  login: (username: string, password: string) => Promise<void>;
  /** Llama a POST /auth/register (con los datos personales) y guarda el usuario/token si fue exitoso. */
  register: (input: RegisterInput) => Promise<void>;
  /** Pide la huella/rostro e inicia sesion con la credencial del dispositivo. */
  loginWithBiometrics: () => Promise<void>;
  /** Activa la biometria para el usuario actual (exige confirmar la contrasena). */
  enableBiometrics: (password: string) => Promise<void>;
  /** Desactiva la biometria en este celular (servidor + almacenamiento local). */
  disableBiometrics: () => Promise<void>;
  /**
   * `true` si conviene ofrecer activar la biometria a quien acaba de entrar con contrasena.
   * Recibe el usuario porque se llama justo despues del login, antes de que el estado se actualice.
   */
  shouldOfferBiometrics: (username: string) => Promise<boolean>;
  /** Guarda que el usuario respondio "Ahora no" a la oferta de biometria. */
  declineBiometricsOffer: (username: string) => Promise<void>;
  /** "No soy yo": quita la biometria de este celular sin iniciar sesion. */
  forgetDevice: () => Promise<void>;
  /** Llamar despues de cambiar la contrasena: el servidor ya revoco las credenciales biometricas. */
  onPasswordChanged: () => Promise<void>;
  /**
   * Actualiza los datos del usuario en memoria (ej. despues de cambiar el nombre en
   * el Perfil), para que el saludo del Inicio muestre el nombre nuevo sin volver a iniciar sesion.
   */
  updateUser: (changes: Partial<Pick<AuthUser, 'fullName'>>) => void;
  /**
   * Cierra la sesion (borra el usuario y el JWT de memoria). La biometria del celular se
   * CONSERVA: la proxima vez el paciente puede entrar con su huella. Para quitarla estan
   * "No soy yo" en el Login y el interruptor del Perfil.
   */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const INITIAL_BIOMETRICS: BiometricState = {
  ready: false,
  capability: { available: false, kind: 'generic', label: 'biometría', icon: 'finger-print' },
  account: null,
};

/**
 * Guarda en memoria el usuario y el token JWT durante la sesion de la app.
 * La sesion (JWT) NO se persiste en disco: al cerrar la app (o cerrar sesion) se pierde y hay
 * que volver a entrar con contrasena o con biometria. Lo unico que se guarda (cifrado) es la credencial
 * biometrica del dispositivo, y solo si el paciente la activo.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricState>(INITIAL_BIOMETRICS);

  /** Vuelve a leer qué soporta el celular y si hay un paciente con biometría activa. */
  const refreshBiometrics = useCallback(async () => {
    const [capability, account] = await Promise.all([getBiometricCapability(), readEnrolledAccount()]);
    setBiometrics({ ready: true, capability, account });
  }, []);

  useEffect(() => {
    refreshBiometrics();
  }, [refreshBiometrics]);

  const startSession = useCallback((nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await loginRequest(username, password);
      startSession(result.user, result.token);
    },
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await registerRequest(input);
      startSession(result.user, result.token);
    },
    [startSession],
  );

  const loginWithBiometrics = useCallback(async () => {
    try {
      const result = await loginWithBiometricsUseCase(`Ingresa a CPO Conecta con tu ${biometrics.capability.label}`);
      startSession(result.user, result.token);
    } finally {
      // Si la credencial se borró (biometría cambiada o revocada), la pantalla debe enterarse.
      await refreshBiometrics();
    }
  }, [biometrics.capability.label, refreshBiometrics, startSession]);

  const enableBiometrics = useCallback(
    async (password: string) => {
      if (!user || !token) throw new Error('Debes iniciar sesion para activar la biometria.');
      await enrollBiometrics(
        token,
        password,
        { username: user.username, fullName: user.fullName },
        `Confirma tu ${biometrics.capability.label} para activar el ingreso`,
      );
      await refreshBiometrics();
    },
    [biometrics.capability.label, refreshBiometrics, token, user],
  );

  const disableBiometrics = useCallback(async () => {
    await disableBiometricsUseCase('disabled');
    await refreshBiometrics();
  }, [refreshBiometrics]);

  const shouldOfferBiometrics = useCallback(
    async (username: string) => {
      if (!biometrics.capability.available) return false;
      if (biometrics.account?.username === username) return false;
      return !(await wasOfferDeclined(username));
    },
    [biometrics.account, biometrics.capability.available],
  );

  const declineBiometricsOffer = useCallback(async (username: string) => {
    await markOfferDeclined(username);
  }, []);

  const forgetDevice = useCallback(async () => {
    await disableBiometricsUseCase('logout');
    await refreshBiometrics();
  }, [refreshBiometrics]);

  const onPasswordChanged = useCallback(async () => {
    await forgetLocalEnrollment();
    await refreshBiometrics();
  }, [refreshBiometrics]);

  const updateUser = useCallback((changes: Partial<Pick<AuthUser, 'fullName'>>) => {
    setUser((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      biometrics,
      login,
      register,
      loginWithBiometrics,
      enableBiometrics,
      disableBiometrics,
      shouldOfferBiometrics,
      declineBiometricsOffer,
      forgetDevice,
      onPasswordChanged,
      updateUser,
      logout,
    }),
    [
      user,
      token,
      biometrics,
      login,
      register,
      loginWithBiometrics,
      enableBiometrics,
      disableBiometrics,
      shouldOfferBiometrics,
      declineBiometricsOffer,
      forgetDevice,
      onPasswordChanged,
      updateUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook de acceso al contexto de autenticacion. Lanza un error si se usa fuera del `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  }
  return context;
}
