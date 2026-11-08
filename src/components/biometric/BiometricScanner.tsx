import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type ComponentProps } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

interface BiometricScannerProps {
  onPress: () => void;
  /** Ícono según la biometría del celular (huella, rostro...). */
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Texto debajo del botón, ej. "Toca para ingresar con tu huella". */
  caption: string;
  /** Mientras se verifica, el botón no responde. */
  disabled?: boolean;
}

/** Botón circular de verificación biométrica con un leve pulso. */
export function BiometricScanner({ onPress, icon = 'finger-print', caption, disabled = false }: BiometricScannerProps) {
  const { s } = useResponsive();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const outerSize = s(104);
  const innerSize = s(78);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={caption}
        accessibilityState={{ disabled, busy: disabled }}
        style={({ pressed }) => [(pressed || disabled) && styles.pressed]}
      >
        <Animated.View
          style={[
            styles.outer,
            { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
            { transform: [{ scale }] },
          ]}
        >
          <View
            style={[
              styles.inner,
              { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
            ]}
          >
            <Ionicons name={icon} size={s(34)} color={colors.cyan} />
          </View>
        </Animated.View>
      </Pressable>

      <AppText style={[styles.caption, { fontSize: s(11) }]}>{caption}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 18 },
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.55)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 169, 224, 0.7)',
    backgroundColor: 'rgba(15, 169, 224, 0.06)',
  },
  caption: { color: colors.textSecondary },
  pressed: { opacity: 0.8 },
});
