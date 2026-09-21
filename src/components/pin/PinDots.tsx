import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';

interface PinDotsProps {
  length: number;
  filled: number;
}

/** Indicadores circulares del PIN (vacío / lleno). */
export function PinDots({ length, filled }: PinDotsProps) {
  const { s } = useResponsive();
  const size = s(16);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${filled} de ${length} dígitos ingresados`}
    >
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < filled;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              { width: size, height: size, borderRadius: size / 2 },
              isFilled && styles.dotFilled,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { borderWidth: 1.5, borderColor: colors.textSecondary },
  dotFilled: { backgroundColor: colors.cyan, borderColor: colors.cyan },
});
