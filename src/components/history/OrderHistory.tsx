import { useCallback, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import type { RemoteState } from '../../hooks/useRefreshableData';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Order } from '../../types/exam';
import { AppText } from '../common/AppText';
import { PlaceholderMessage } from '../common/PlaceholderMessage';
import { SectionTitle } from '../home/SectionTitle';
import { OrderAccordionItem } from './OrderAccordionItem';

interface OrderHistoryProps {
  /** Órdenes del paciente (las carga HomeScreen, que también maneja la recarga). */
  state: RemoteState<Order[]>;
  onRetry: () => void;
}

/**
 * Pestaña "Historial": todas las órdenes del paciente, de la más reciente a la más
 * antigua (el backend ya las entrega en ese orden). Cada orden es un acordeón que
 * despliega sus exámenes al tocarla.
 */
export function OrderHistory({ state, onRetry }: OrderHistoryProps) {
  const { s } = useResponsive();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /** Abre o cierra una orden (se pueden tener varias abiertas a la vez). */
  const toggleOrder = useCallback((orderId: string) => {
    // Anima el cambio de altura al abrir/cerrar, para que se sienta como un acordeón.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }, []);

  if (state.status === 'loading') {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primaryBright} />
        <AppText style={styles.centerStateText}>Cargando tu historial…</AppText>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.centerState}>
        <PlaceholderMessage icon="alert-circle-outline" title="No se pudo conectar" description={state.message} />
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={10}>
          <AppText weight="semibold" style={styles.retryText}>
            Reintentar
          </AppText>
        </Pressable>
      </View>
    );
  }

  if (state.data.length === 0) {
    return (
      <PlaceholderMessage
        icon="time-outline"
        title="Aún no tienes órdenes"
        description="Cada vez que vayas al laboratorio, tu orden va a quedar guardada aquí."
      />
    );
  }

  return (
    <View style={{ gap: s(10) }}>
      <SectionTitle title={`TUS ÓRDENES (${state.data.length})`} />
      {state.data.map((order) => (
        <OrderAccordionItem
          key={order.id}
          order={order}
          expanded={expandedIds.has(order.id)}
          onToggle={() => toggleOrder(order.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  centerStateText: { color: colors.textSecondary, fontSize: 12 },
  retryText: { color: colors.primaryBright, textDecorationLine: 'underline' },
});
