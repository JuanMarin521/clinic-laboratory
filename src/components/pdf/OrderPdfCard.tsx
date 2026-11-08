import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Order } from '../../types/exam';
import { formatLongDate } from '../../utils/format';
import { AppText } from '../common/AppText';

interface OrderPdfCardProps {
  order: Order;
  downloading: boolean;
  /** `true` mientras se descarga otra orden: el botón queda inactivo. */
  disabled: boolean;
  onDownload: () => void;
}

/**
 * Tarjeta de una orden en "Examen PDF": número, fecha, sede, cuántos exámenes están
 * validados y el botón para descargar el PDF de la orden completa.
 */
export function OrderPdfCard({ order, downloading, disabled, onDownload }: OrderPdfCardProps) {
  const { s } = useResponsive();
  const total = order.exams.length;
  const validated = order.summary.ready;
  const pending = total - validated;
  const canDownload = validated > 0;
  const date = formatLongDate(order.date);

  let statusText = `${validated} de ${total} validados`;
  if (!canDownload) statusText = 'Aún no hay exámenes validados';
  else if (pending === 0) statusText = `Todos validados (${total})`;

  return (
    <View style={[styles.card, { padding: s(14), gap: s(12) }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { width: s(40), height: s(40) }]}>
          <Ionicons name="document-text-outline" size={s(20)} color={colors.primaryBright} />
        </View>
        <View style={styles.texts}>
          <AppText weight="bold" style={{ fontSize: s(15) }}>
            {`Orden #${order.orderNumber}`}
          </AppText>
          <AppText style={[styles.muted, { fontSize: s(11) }]}>{`${date} · Sede ${order.site}`}</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.status}>
          <Ionicons
            name={pending === 0 ? 'checkmark-circle' : 'time-outline'}
            size={s(15)}
            color={pending === 0 ? colors.success : colors.warning}
          />
          <AppText style={[styles.muted, { fontSize: s(11) }]}>{statusText}</AppText>
        </View>

        <Pressable
          onPress={onDownload}
          disabled={!canDownload || disabled}
          accessibilityRole="button"
          accessibilityLabel={`Descargar PDF de la orden ${order.orderNumber}`}
          accessibilityHint={canDownload ? statusText : 'Disponible cuando haya exámenes validados'}
          accessibilityState={{ disabled: !canDownload || disabled, busy: downloading }}
          style={({ pressed }) => [
            styles.button,
            { paddingHorizontal: s(12), height: s(36) },
            (!canDownload || (disabled && !downloading)) && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.primaryBright} />
          ) : (
            <Ionicons name="download-outline" size={s(16)} color={colors.primaryBright} />
          )}
          <AppText weight="semibold" style={[styles.buttonText, { fontSize: s(12) }]}>
            {downloading ? 'Descargando' : 'Descargar'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.4)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  muted: { color: colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.5)',
    backgroundColor: 'rgba(31, 111, 229, 0.1)',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.primaryBright },
  pressed: { opacity: 0.7 },
});
