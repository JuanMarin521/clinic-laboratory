import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppLockGate } from './src/components/security/AppLockGate';
import { SessionGuard } from './src/components/security/SessionGuard';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { useAppFonts } from './src/hooks/useAppFonts';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const fontsLoaded = useAppFonts();

  // Mientras carga la tipografía se muestra el fondo de la app (evita parpadeo blanco).
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bgTop }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* AuthProvider guarda el usuario y el token JWT en memoria durante la sesión,
          disponibles en cualquier pantalla a través del hook useAuth(). */}
      <AuthProvider>
        {/* ToastProvider: mensajes flotantes (ej. "Descarga exitosa") encima de cualquier pantalla. */}
        <ToastProvider>
          <AppNavigator />
          {/* Bloqueo por inactividad: se dibuja encima de cualquier pantalla. */}
          <AppLockGate />
          {/* Sesión vencida (401): vuelve al login desde cualquier pantalla. */}
          <SessionGuard />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
