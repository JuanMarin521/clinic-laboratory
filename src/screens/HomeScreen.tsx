import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError, fetchExams, type ExamSummary } from '../api';
import { AppText } from '../components/common/AppText';
import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { SegmentedControl, type SegmentOption } from '../components/common/SegmentedControl';
import { ExamListItem } from '../components/home/ExamListItem';
import { SectionTitle } from '../components/home/SectionTitle';
import { StatusSummary } from '../components/home/StatusSummary';
import { WelcomeHeader } from '../components/home/WelcomeHeader';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme';
import type { Exam } from '../types/exam';
import { groupExamsIntoSections } from '../utils/examGrouping';

type HomeTab = 'home' | 'history' | 'profile';

const HOME_TABS: SegmentOption<HomeTab>[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'history', label: 'Historial' },
  { key: 'profile', label: 'Perfil' },
];

/** Estado de la carga de exámenes: en curso, con error, o lista + resumen ya recibidos. */
type ExamsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: ExamSummary; exams: Exam[] };

/** Pantalla 4 — Home / Resultados, conectada a GET /api/v1/exams. */
export function HomeScreen(_props: MainTabScreenProps<'Results'>) {
  const { s } = useResponsive();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [examsState, setExamsState] = useState<ExamsState>({ status: 'loading' });

  const loadExams = useCallback(async () => {
    if (!token) return;

    setExamsState({ status: 'loading' });
    try {
      const result = await fetchExams(token);
      setExamsState({ status: 'ready', summary: result.summary, exams: result.exams });
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
        <WelcomeHeader name={user?.fullName ?? 'Paciente'} />

        <SegmentedControl options={HOME_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'home' ? (
          <HomeResultsSection state={examsState} onRetry={loadExams} spacing={s} />
        ) : (
          <PlaceholderMessage
            icon={activeTab === 'history' ? 'time-outline' : 'person-outline'}
            title={activeTab === 'history' ? 'Historial' : 'Perfil'}
            description="Esta sección estará disponible en la siguiente entrega."
          />
        )}
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

  const sections = groupExamsIntoSections(state.exams);

  return (
    <>
      <StatusSummary counts={state.summary} />

      {sections.map((section) => (
        <View key={section.id} style={{ gap: s(10) }}>
          <SectionTitle title={section.title} />
          {section.data.map((exam) => (
            <ExamListItem key={exam.id} exam={exam} />
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  centerStateText: { color: colors.textSecondary, fontSize: 12 },
  retryText: { color: colors.primaryBright, textDecorationLine: 'underline' },
});
