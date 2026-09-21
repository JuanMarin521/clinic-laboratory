import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { SegmentedControl, type SegmentOption } from '../components/common/SegmentedControl';
import { ExamListItem } from '../components/home/ExamListItem';
import { SectionTitle } from '../components/home/SectionTitle';
import { StatusSummary } from '../components/home/StatusSummary';
import { WelcomeHeader } from '../components/home/WelcomeHeader';
import { mockExamSections } from '../data/mockExams';
import { mockUser } from '../data/mockUser';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { gradients } from '../theme';
import { countByStatus } from '../utils/examStats';

type HomeTab = 'home' | 'history' | 'profile';

const HOME_TABS: SegmentOption<HomeTab>[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'history', label: 'Historial' },
  { key: 'profile', label: 'Perfil' },
];

/** Pantalla 4 — Home / Resultados: semáforo de estados y lista de exámenes por fecha. */
export function HomeScreen(_props: MainTabScreenProps<'Results'>) {
  const { s } = useResponsive();
  const [activeTab, setActiveTab] = useState<HomeTab>('home');

  const counts = useMemo(
    () => countByStatus(mockExamSections.flatMap((section) => section.data)),
    [],
  );

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: s(20), paddingTop: s(24), gap: s(20) }]}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader name={mockUser.fullName} />

        <SegmentedControl options={HOME_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'home' ? (
          <>
            <StatusSummary counts={counts} />

            {mockExamSections.map((section) => (
              <View key={section.id} style={{ gap: s(10) }}>
                <SectionTitle title={section.title} />
                {section.data.map((exam) => (
                  <ExamListItem key={exam.id} exam={exam} />
                ))}
              </View>
            ))}
          </>
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

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
});
