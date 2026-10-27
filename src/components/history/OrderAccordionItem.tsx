import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Order } from '../../types/exam';
import { formatLongDate } from '../../utils/format';
import { AppText } from '../common/AppText';
import { ExamListItem } from '../home/ExamListItem';

interface OrderAccordionItemProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Fila de una orden en el Historial, en forma de acordeón:
 * la cabecera (número, fecha y sede) siempre se ve; al tocarla se despliegan
 * debajo los exámenes de esa orden, y al tocarla otra vez se ocultan.
 */
export function OrderAccordionItem({ order, expanded, onToggle }: OrderAccordionItemProps) {
  const { s } = useResponsive();
  const date = formatLongDate(order.date);
  const examCount = order.exams.length;

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Orden número ${order.orderNumber.split('').join(' ')}, ${date}, sede ${order.site}, ${examCount} exámenes`}
        accessibilityHint={expanded ? 'Oculta los exámenes de la orden' : 'Muestra los exámenes de la orden'}
        style={({ pressed }) => [styles.header, { padding: s(14) }, pressed && styles.pressed]}
      >
        <View style={[styles.iconBox, { width: s(38), height: s(38) }]}>
          <Ionicons name="receipt-outline" size={s(20)} color={colors.primaryBright} />
        </View>

        <View style={styles.texts}>
          <AppText weight="bold" style={{ fontSize: s(15) }}>
            {`#${order.orderNumber}`}
          </AppText>
          <AppText style={[styles.meta, { fontSize: s(11) }]}>{date}</AppText>
          <AppText style={[styles.meta, { fontSize: s(11) }]}>{`Sede ${order.site}`}</AppText>
        </View>

        <View style={styles.right}>
          <AppText weight="medium" style={[styles.meta, { fontSize: s(10) }]}>
            {`${examCount} ${examCount === 1 ? 'examen' : 'exámenes'}`}
          </AppText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={s(18)}
            color={expanded ? colors.primaryBright : colors.textSecondary}
          />
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.body, { paddingHorizontal: s(10), paddingBottom: s(10), gap: s(8) }]}>
          {order.exams.map((exam) => (
            <ExamListItem key={exam.id} exam={exam} showDetails={false} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cardExpanded: { borderColor: 'rgba(31, 111, 229, 0.45)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.75 },
  iconBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.4)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  meta: { color: colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 4 },
  body: { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 10 },
});
