import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError, fetchExamPdfBytes, fetchExams } from '../api';
import { AppText } from '../components/common/AppText';
import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { PdfExamItem } from '../components/pdf/PdfExamItem';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme';
import type { Exam } from '../types/exam';

/** Estado de la carga de examenes descargables (los que ya están en estado "Listo"). */
type ScreenState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; exams: Exam[] };

/**
 * Pantalla "Examen PDF": lista los exámenes del paciente que ya están listos y
 * permite descargar y compartir el PDF real de cada uno (GET /exams/:id/pdf/file).
 */
export function ExamPdfScreen(_props: MainTabScreenProps<'ExamPdf'>) {
  const { s } = useResponsive();
  const { token } = useAuth();
  const [state, setState] = useState<ScreenState>({ status: 'loading' });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    if (!token) return;

    setState({ status: 'loading' });
    try {
      const result = await fetchExams(token);
      const readyExams = result.exams.filter((exam) => exam.status === 'ready');
      setState({ status: 'ready', exams: readyExams });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudieron cargar tus exámenes. Intenta de nuevo.';
      setState({ status: 'error', message });
    }
  }, [token]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleDownload = useCallback(
    async (examId: string) => {
      if (!token || downloadingId) return;

      setDownloadingId(examId);
      try {
        const { bytes, fileName } = await fetchExamPdfBytes(examId, token);

        // Guarda el PDF en la carpeta de cache de la app y lo abre con el "compartir" nativo
        // (desde ahí el usuario puede guardarlo, enviarlo o abrirlo con otra app).
        const file = new File(Paths.cache, fileName);
        file.write(bytes);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: fileName });
        } else {
          Alert.alert('PDF descargado', `Se guardó como "${fileName}" en la carpeta temporal de la app.`);
        }
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'No se pudo descargar el PDF. Intenta de nuevo.';
        Alert.alert('No se pudo descargar', message);
      } finally {
        setDownloadingId(null);
      }
    },
    [token, downloadingId],
  );

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: s(20), paddingTop: s(24), gap: s(14) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: s(4) }}>
          <AppText weight="bold" style={{ fontSize: s(20) }}>
            Examen PDF
          </AppText>
          <AppText style={[styles.subtitle, { fontSize: s(12) }]}>
            Descarga el resultado de tus exámenes ya listos.
          </AppText>
        </View>

        <ExamPdfList state={state} downloadingId={downloadingId} onDownload={handleDownload} onRetry={loadExams} />
      </ScrollView>
    </ScreenContainer>
  );
}

interface ExamPdfListProps {
  state: ScreenState;
  downloadingId: string | null;
  onDownload: (examId: string) => void;
  onRetry: () => void;
}

/** Sub-sección que resuelve los 4 estados posibles: cargando, error, vacío o con exámenes. */
function ExamPdfList({ state, downloadingId, onDownload, onRetry }: ExamPdfListProps) {
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

  if (state.exams.length === 0) {
    return (
      <PlaceholderMessage
        icon="document-text-outline"
        title="Nada por descargar todavía"
        description="Cuando un examen tuyo pase a estado “Listo”, vas a poder descargar su PDF aquí."
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {state.exams.map((exam) => (
        <PdfExamItem
          key={exam.id}
          exam={exam}
          downloading={downloadingId === exam.id}
          onDownload={() => onDownload(exam.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  subtitle: { color: colors.textSecondary },
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  centerStateText: { color: colors.textSecondary, fontSize: 12 },
  retryText: { color: colors.primaryBright, textDecorationLine: 'underline' },
});
