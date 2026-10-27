import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

interface ProfileInfoRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Valor a mostrar. Si está vacío se muestra "Sin registrar" en gris. */
  value: string | null;
}

/** Fila de solo lectura del Perfil: ícono, etiqueta y valor. */
export function ProfileInfoRow({ icon, label, value }: ProfileInfoRowProps) {
  const { s } = useResponsive();

  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value || 'sin registrar'}`}>
      <View style={[styles.iconBox, { width: s(34), height: s(34) }]}>
        <Ionicons name={icon} size={s(17)} color={colors.textSecondary} />
      </View>
      <View style={styles.texts}>
        <AppText style={[styles.label, { fontSize: s(10) }]}>{label}</AppText>
        <AppText
          weight={value ? 'medium' : 'regular'}
          style={[{ fontSize: s(13) }, !value && styles.empty]}
        >
          {value || 'Sin registrar'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  label: { color: colors.textSecondary },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
});
