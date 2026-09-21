import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors, gradients } from '../../theme';
import { AppText } from './AppText';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

/** Botón principal con tres estados: normal, deshabilitado y cargando. */
export function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel = 'VERIFICANDO ...',
}: GradientButtonProps) {
  const { s } = useResponsive();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [loading, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const gradient = loading
    ? gradients.loadingButton
    : disabled
      ? gradients.disabledButton
      : gradients.primaryButton;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={loading ? loadingLabel : label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.button, { height: s(52) }, loading && styles.loadingBorder]}
      >
        {loading ? (
          <View style={styles.row}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="sync-outline" size={s(18)} color={colors.white} />
            </Animated.View>
            <AppText weight="semibold" style={[styles.label, { fontSize: s(12) }]}>
              {loadingLabel}
            </AppText>
          </View>
        ) : (
          <AppText
            weight="semibold"
            style={[
              styles.label,
              { fontSize: s(12) },
              disabled && { color: colors.textSecondary },
            ]}
          >
            {label}
          </AppText>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingBorder: {
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.35)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { letterSpacing: 1, color: colors.white },
  pressed: { opacity: 0.85 },
});
