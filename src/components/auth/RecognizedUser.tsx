import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';

interface RecognizedUserProps {
  name: string;
  /** Texto del estado bajo el nombre, ej. "Ingreso con huella activo". */
  status: string;
  onNotMe: () => void;
}

/** Cabecera del paciente reconocido en este celular: avatar, nombre, estado y enlace "No soy yo". */
export function RecognizedUser({ name, status, onNotMe }: RecognizedUserProps) {
  const { s } = useResponsive();

  return (
    <View style={styles.container}>
      <Avatar size={s(64)} />
      <AppText weight="semibold" style={[styles.name, { fontSize: s(16) }]}>
        {name}
      </AppText>

      <View style={styles.statusRow}>
        <View style={styles.dot} />
        <AppText weight="medium" style={[styles.status, { fontSize: s(11) }]}>
          {status}
        </AppText>
      </View>

      <Pressable
        onPress={onNotMe}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityHint="Quita el ingreso biométrico de este celular"
      >
        <AppText style={[styles.notMe, { fontSize: s(11) }]}>No soy yo</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  name: { marginTop: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  status: { color: colors.success },
  notMe: { color: colors.textSecondary, textDecorationLine: 'underline', marginTop: 2 },
});
