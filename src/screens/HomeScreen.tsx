import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError, fetchLatestOrder } from '../api';
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
 * Estado de la carga de la última orden: en curso, con error, o ya recibida
 * (`order` es `null` si el paciente todavía no tiene ninguna orden).
 */
type ExamsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; order: Order | null };

/**
 * Pantalla 4 — Home / Resultados, conectada a GET /api/v1/orders/latest.
 * Solo muestra la orden más reciente (los exámenes de la última visita al laboratorio).
 */
export function HomeScreen(_props: MainTabScreenProps<'Results'>) {
  const { s } = useResponsive();
  const { user, token } = useAuth();
  // El Perfil vive en el stack raíz (fuera de las pestañas), por eso se navega con ese tipo.
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [examsState, setExamsState] = useState<ExamsState>({ status: 'loading' });

  const loadExams = useCallback(async () => {
    if (!token) return;

    setExamsState({ status: 'loading' });
    try {
      const order = await fetchLatestOrder(token);
      setExamsState({ status: 'ready', order });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudieron cargar tus exámenes. Intenta de nuevo.';
      setExamsState({ status: 'error', message });
    }
  }, [token]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: s(20), paddingTop: s(24), gap: s(20) }]}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader name={user?.fullName ?? 'Paciente'} onAvatarPress={() => rootNavigation.navigate('Profile')} />

        <SegmentedControl options={HOME_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'home' && <HomeResultsSection state={examsState} onRetry={loadExams} spacing={s} />}

        {/* Historial: todas las órdenes, cada una como acordeón con sus exámenes. */}
        {activeTab === 'history' && <OrderHistory />}

      </ScrollView>
    </ScreenContainer>
  );
}

interface HomeResultsSectionProps {
  state: ExamsState;
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

  const { order } = state;

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
