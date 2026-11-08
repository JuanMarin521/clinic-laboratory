import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { fetchLatestOrder, fetchOrders } from '../api';
import { AppText } from '../components/common/AppText';
import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { SegmentedControl, type SegmentOption } from '../components/common/SegmentedControl';
import { OrderHistory } from '../components/history/OrderHistory';
import { ExamListItem } from '../components/home/ExamListItem';
import { OrderHeader } from '../components/home/OrderHeader';
import { SectionTitle } from '../components/home/SectionTitle';
import { StatusSummary } from '../components/home/StatusSummary';
import { WelcomeHeader } from '../components/home/WelcomeHeader';
import { useAuth } from '../context/AuthContext';
import { useRefreshableData, type RemoteState } from '../hooks/useRefreshableData';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps, RootStackParamList } from '../navigation/types';
import { colors, gradients } from '../theme';
import type { Order } from '../types/exam';

type HomeTab = 'home' | 'history';

/** El Perfil ya no es una pestaña: se abre tocando el avatar de la cabecera. */
const HOME_TABS: SegmentOption<HomeTab>[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'history', label: 'Historial' },
];

/**
 * Pantalla 4 — Home / Resultados.
 * - Inicio: solo la orden más reciente (GET /api/v1/orders/latest).
 * - Historial: todas las órdenes (GET /api/v1/orders), se carga al abrir esa pestaña.
 * Los datos se recargan al volver a la pantalla y deslizando hacia abajo.
 */
export function HomeScreen(_props: MainTabScreenProps<'Results'>) {
  const { s } = useResponsive();
  const { user, token } = useAuth();
  // El Perfil vive en el stack raíz (fuera de las pestañas), por eso se navega con ese tipo.
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<HomeTab>('home');

  // Sin sesión no hay nada que cargar (`null`).
  const loadLatest = useMemo(() => (token ? () => fetchLatestOrder(token) : null), [token]);
  const loadHistory = useMemo(() => (token ? () => fetchOrders(token) : null), [token]);

  const latest = useRefreshableData(loadLatest, 'No se pudieron cargar tus exámenes. Intenta de nuevo.');
  const history = useRefreshableData(loadHistory, 'No se pudo cargar tu historial. Intenta de nuevo.', {
    enabled: activeTab === 'history',
  });
  const active = activeTab === 'home' ? latest : history;

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: s(20), paddingTop: s(24), gap: s(20) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={active.refreshing}
            onRefresh={active.refresh}
            tintColor={colors.primaryBright}
            colors={[colors.primaryBright]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <WelcomeHeader name={user?.fullName ?? 'Paciente'} onAvatarPress={() => rootNavigation.navigate('Profile')} />

        <SegmentedControl options={HOME_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'home' && <HomeResultsSection state={latest.state} onRetry={latest.retry} spacing={s} />}

        {/* Historial: todas las órdenes, cada una como acordeón con sus exámenes. */}
        {activeTab === 'history' && <OrderHistory state={history.state} onRetry={history.retry} />}
      </ScrollView>
    </ScreenContainer>
  );
}

interface HomeResultsSectionProps {
  /** `data` es `null` si el paciente todavía no tiene ninguna orden. */
  state: RemoteState<Order | null>;
  onRetry: () => void;
  spacing: (size: number) => number;
}

/** Sub-sección de resultados: maneja los 3 estados posibles de la petición a la API. */
function HomeResultsSection({ state, onRetry, spacing: s }: HomeResultsSectionProps) {
  if (state.status === 'loading') {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primaryBright} />
        <AppText style={styles.centerStateText}>Cargando tus exámenes…</AppText>
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

  const order = state.data;

  if (!order || order.exams.length === 0) {
    return (
      <PlaceholderMessage
        icon="flask-outline"
        title="Aún no tienes exámenes"
        description="Cuando tu laboratorio registre una orden a tu nombre, va a aparecer aquí."
      />
    );
  }

  return (
    <>
      <View style={{ gap: s(10) }}>
        <SectionTitle title="ÚLTIMA ORDEN" />
        <OrderHeader order={order} />
      </View>

      <StatusSummary counts={order.summary} />

      <View style={{ gap: s(10) }}>
        <SectionTitle title={`EXÁMENES DE LA ORDEN (${order.exams.length})`} />
        {order.exams.map((exam) => (
          <ExamListItem key={exam.id} exam={exam} showDetails={false} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  centerStateText: { color: colors.textSecondary, fontSize: 12 },
  retryText: { color: colors.primaryBright, textDecorationLine: 'underline' },
});
