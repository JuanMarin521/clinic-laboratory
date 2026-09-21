import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <AppNavigator />
    </SafeAreaProvider>
  );
}
