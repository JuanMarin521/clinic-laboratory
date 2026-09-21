import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH } from '../../hooks/useResponsive';
import { gradients } from '../../theme';

type GradientColors = readonly [string, string, ...string[]];

interface ScreenContainerProps {
  children: ReactNode;
  /** Envuelve el contenido en un ScrollView (útil en landscape y pantallas pequeñas). */
  scroll?: boolean;
  gradient?: GradientColors;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Contenedor base de todas las pantallas:
 * fondo con degradado a pantalla completa + área segura + columna centrada
 * con ancho máximo (así en tablets el diseño no se estira).
 */
export function ScreenContainer({
  children,
  scroll = false,
  gradient = gradients.screen,
  edges = ['top', 'bottom'],
  contentStyle,
}: ScreenContainerProps) {
  const column = <View style={[styles.column, contentStyle]}>{children}</View>;

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={edges} style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {column}
          </ScrollView>
        ) : (
          column
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
});
