import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';

/** Cabecera del chat: avatar del asistente, nombre y estado "En línea". */
export function ChatHeader() {
  const { s } = useResponsive();

  return (
    <View style={[styles.container, { paddingVertical: s(14) }]}>
      <Avatar size={s(44)} tone="assistant" />
      <View style={styles.texts}>
        <AppText weight="semibold" style={{ fontSize: s(14) }}>
          CPO Assist
        </AppText>
        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <AppText style={[styles.status, { fontSize: s(10) }]}>En línea</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: 'rgba(8, 20, 38, 0.9)',
  },
  texts: { gap: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  status: { color: colors.success },
});
