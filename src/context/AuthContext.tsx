import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { loginRequest, registerRequest, type AuthUser } from '../api';

interface AuthContextValue {
  /** Usuario autenticado actualmente, o `null` si nadie ha iniciado sesion. */
  user: AuthUser | null;
  /** Token JWT vigente, necesario para llamar a las rutas protegidas de la API. */
  token: string | null;
  /** Llama a POST /auth/login y guarda el usuario/token si fue exitoso. */
  login: (username: string, password: string) => Promise<void>;
  /** Llama a POST /auth/register y guarda el usuario/token si fue exitoso. */
  register: (fullName: string, username: string, password: string) => Promise<void>;
  /** Limpia la sesion actual (vuelve a dejar `user`/`token` en null). */
  logout: () => void;
  /**
   * Actualiza los datos del usuario en memoria (ej. despues de cambiar el nombre en
   * el Perfil), para que el saludo del Inicio muestre el nombre nuevo sin volver a iniciar sesion.
   */
  updateUser: (changes: Partial<Pick<AuthUser, 'fullName'>>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Guarda en memoria el usuario y el token JWT durante la sesion de la app.
 * No se persiste en disco a proposito: al cerrar la app se pierde la sesion,
 * igual que exige el flujo de "Login -> Biometrico/PIN" en cada apertura.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const register = useCallback(async (fullName: string, username: string, password: string) => {
    const result = await registerRequest(fullName, username, password);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((changes: Partial<Pick<AuthUser, 'fullName'>>) => {
    setUser((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout, updateUser }),
    [user, token, login, register, logout, updateUser],
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
