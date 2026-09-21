import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors, gradients } from '../../theme';
import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  active: T;
  onChange: (key: T) => void;
  /** solid: azul plano (Home). gradient: degradado azul→cyan (Biométrico/PIN). */
  variant?: 'solid' | 'gradient';
}

/** Selector segmentado reutilizable (pestañas del Home y modo de acceso). */
export function SegmentedControl<T extends string>({
  options,
  active,
  onChange,
  variant = 'solid',
}: SegmentedControlProps<T>) {
  const { s } = useResponsive();

  return (
    <View style={[styles.container, variant === 'gradient' && styles.containerRounded]}>
      {options.map((option) => {
        const isActive = option.key === active;
        const textStyle = [
          { fontSize: s(12) },
          { color: isActive ? colors.white : colors.textSecondary },
        ];

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.segment, { minHeight: s(36) }]}
          >
            {isActive && variant === 'gradient' ? (
              <LinearGradient
                colors={gradients.primaryButton}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFill, styles.activeFill]}
              />
            ) : null}
            {isActive && variant === 'solid' ? (
              <View style={[StyleSheet.absoluteFill, styles.activeFill, styles.solidFill]} />
            ) : null}
            <AppText weight={isActive ? 'semibold' : 'medium'} style={textStyle}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0D172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 3,
  },
  containerRounded: { borderRadius: 14, padding: 4 },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeFill: { borderRadius: 10 },
  solidFill: { backgroundColor: colors.primary },
});
