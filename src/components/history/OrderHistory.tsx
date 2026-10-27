import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import { ApiError, fetchOrders } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Order } from '../../types/exam';
import { AppText } from '../common/AppText';
import { PlaceholderMessage } from '../common/PlaceholderMessage';
import { SectionTitle } from '../home/SectionTitle';
import { OrderAccordionItem } from './OrderAccordionItem';

type HistoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; orders: Order[] };

/**
 * Pestaña "Historial": todas las órdenes del paciente (GET /api/v1/orders),
 * de la más reciente a la más antigua (el backend ya las entrega en ese orden).
 * Cada orden es un acordeón que despliega sus exámenes al tocarla.
 */
export function OrderHistory() {
  const { s } = useResponsive();
  const { token } = useAuth();
  const [state, setState] = useState<HistoryState>({ status: 'loading' });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadOrders = useCallback(async () => {
    if (!token) return;

    setState({ status: 'loading' });
    try {
      const orders = await fetchOrders(token);
      setState({ status: 'ready', orders });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo cargar tu historial. Intenta de nuevo.';
      setState({ status: 'error', message });
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
        <Pressable onPress={loadOrders} accessibilityRole="button" hitSlop={10}>
          <AppText weight="semibold" style={styles.retryText}>
            Reintentar
          </AppText>
        </Pressable>
      </View>
    );
  }

  if (state.orders.length === 0) {
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
      <SectionTitle title={`TUS ÓRDENES (${state.orders.length})`} />
      {state.orders.map((order) => (
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
