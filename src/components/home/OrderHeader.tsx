import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Order } from '../../types/exam';
import { formatLongDate } from '../../utils/format';
import { AppText } from '../common/AppText';

interface OrderHeaderProps {
  order: Order;
}

/** Tarjeta con los datos de una orden: número, fecha de la visita y sede. */
export function OrderHeader({ order }: OrderHeaderProps) {
  const { s } = useResponsive();
  const date = formatLongDate(order.date);

  return (
    <View
      accessible
      accessibilityLabel={`Orden número ${order.orderNumber.split('').join(' ')}, ${date}, sede ${order.site}`}
      style={[styles.card, { padding: s(14), gap: s(10) }]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.iconBox, { width: s(38), height: s(38) }]}>
          <Ionicons name="receipt-outline" size={s(20)} color={colors.primaryBright} />
        </View>
        <View style={styles.texts}>
          <AppText weight="medium" style={[styles.label, { fontSize: s(10) }]}>
            ORDEN
          </AppText>
          <AppText weight="bold" style={{ fontSize: s(20) }}>
            {`#${order.orderNumber}`}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ gap: s(6) }}>
        <MetaRow icon="calendar-outline" text={date} size={s(12)} />
        <MetaRow icon="location-outline" text={`Sede ${order.site}`} size={s(12)} />
      </View>
    </View>
  );
}

function MetaRow({ icon, text, size }: { icon: keyof typeof Ionicons.glyphMap; text: string; size: number }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={size + 2} color={colors.textSecondary} />
      <AppText style={{ fontSize: size, color: colors.textSecondary }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.4)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  label: { color: colors.textSecondary, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: colors.borderSoft },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
