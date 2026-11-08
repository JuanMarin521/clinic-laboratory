import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError, fetchOrderPdf, fetchOrders } from '../api';
import { AppText } from '../components/common/AppText';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { OrderPdfCard } from '../components/pdf/OrderPdfCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRefreshableData, type RemoteState } from '../hooks/useRefreshableData';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme';
import type { Order } from '../types/exam';
import {
  changeDownloadFolder,
  clearTemporaryPdfs,
  getDownloadFolderName,
  savePdf,
  savesToFolder,
} from '../utils/pdfDownloads';

/** Texto del aviso para una orden que aún tiene exámenes pendientes de validación. */
function pendingMessage(order: Order): string {
  const validated = order.summary.ready;
  const pending = order.exams.length - validated;
  const pendingText = pending === 1 ? '1 examen pendiente' : `${pending} exámenes pendientes`;
  const validatedText = validated === 1 ? 'el examen ya validado' : `los ${validated} exámenes ya validados`;
  return `La orden #${order.orderNumber} aún tiene ${pendingText} de validación (en proceso o con novedad).\n\n¿Deseas descargar de todas maneras ${validatedText}?`;
}

/**
 * Pantalla "Examen PDF": las órdenes del paciente (de la más reciente a la más antigua),
 * cada una con UN botón para descargar su PDF completo (GET /orders/:orderNumber/pdf/file).
 * - Orden con todo validado: se descarga de una vez y aparece un mensaje de éxito.
 * - Orden con exámenes pendientes: se pregunta antes (ConfirmDialog); si acepta, el PDF trae solo los validados.
 */
export function ExamPdfScreen(_props: MainTabScreenProps<'ExamPdf'>) {
  const { s } = useResponsive();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [downloadingNumber, setDownloadingNumber] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | null>(() => getDownloadFolderName());
  /** Orden con exámenes pendientes que espera la confirmación del paciente. */
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);

  const loadOrders = useMemo(() => (token ? () => fetchOrders(token) : null), [token]);
  const { state, refreshing, refresh, retry } = useRefreshableData(
    loadOrders,
    'No se pudieron cargar tus órdenes. Intenta de nuevo.',
  );

  // Por si quedó algún PDF temporal de una sesión anterior.
  useEffect(() => {
    clearTemporaryPdfs();
  }, []);

  /** Descarga y guarda el PDF de la orden (solo trae los exámenes validados). */
  const downloadOrder = useCallback(
    async (order: Order) => {
      if (!token || downloadingNumber) return;

      setDownloadingNumber(order.orderNumber);
      try {
        const { bytes, fileName } = await fetchOrderPdf(order.orderNumber, token);
        const result = await savePdf(fileName, bytes);

        if (result.status === 'saved') {
          setFolderName(result.folderName);
          showToast(`Descarga exitosa: ${fileName} se guardó en "${result.folderName}".`);
        } else if (result.status === 'shared') {
          showToast(`PDF de la orden #${order.orderNumber} listo.`);
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'No se pudo descargar el PDF. Intenta de nuevo.';
        showToast(message, 'error');
      } finally {
        setDownloadingNumber(null);
      }
    },
    [token, downloadingNumber, showToast],
  );

  /** Si la orden tiene pendientes, primero pregunta; si está toda validada, descarga de una vez. */
  const handleDownload = useCallback(
    (order: Order) => {
      if (order.summary.ready < order.exams.length) setOrderToConfirm(order);
      else downloadOrder(order);
    },
    [downloadOrder],
  );

  const confirmDownload = useCallback(() => {
    const order = orderToConfirm;
    setOrderToConfirm(null);
    if (order) downloadOrder(order);
  }, [downloadOrder, orderToConfirm]);

  const handleChangeFolder = useCallback(async () => {
    try {
      const name = await changeDownloadFolder();
      if (name) {
        setFolderName(name);
        showToast(`Los PDF se guardarán en "${name}".`, 'info');
      }
    } catch {
      showToast('No se pudo cambiar la carpeta de descargas.', 'error');
    }
  }, [showToast]);

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: s(20), paddingTop: s(24), gap: s(14) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primaryBright}
            colors={[colors.primaryBright]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={{ gap: s(4) }}>
          <AppText weight="bold" style={{ fontSize: s(20) }}>
            Examen PDF
          </AppText>
          <AppText style={[styles.subtitle, { fontSize: s(12) }]}>
            Descarga en un solo PDF los exámenes validados de cada orden.
          </AppText>
          {savesToFolder ? (
            <Pressable onPress={handleChangeFolder} accessibilityRole="button" hitSlop={8} style={styles.folderRow}>
              <AppText style={[styles.subtitle, { fontSize: s(11) }]}>
                {folderName ? `Se guardan en "${folderName}" · ` : 'Elegirás la carpeta en la primera descarga · '}
                <AppText weight="semibold" style={styles.link}>
                  {folderName ? 'Cambiar' : 'Elegir ahora'}
                </AppText>
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <OrderPdfList state={state} downloadingNumber={downloadingNumber} onDownload={handleDownload} onRetry={retry} />
      </ScrollView>

      <ConfirmDialog
        visible={orderToConfirm !== null}
        title="Hay exámenes pendientes"
        message={orderToConfirm ? pendingMessage(orderToConfirm) : ''}
        confirmLabel="DESCARGAR"
        onConfirm={confirmDownload}
        onCancel={() => setOrderToConfirm(null)}
      />
    </ScreenContainer>
  );
}

interface OrderPdfListProps {
  state: RemoteState<Order[]>;
  downloadingNumber: string | null;
  onDownload: (order: Order) => void;
  onRetry: () => void;
}

/** Sub-sección que resuelve los 4 estados posibles: cargando, error, vacío o con órdenes. */
function OrderPdfList({ state, downloadingNumber, onDownload, onRetry }: OrderPdfListProps) {
  const { s } = useResponsive();

  if (state.status === 'loading') {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primaryBright} />
        <AppText style={styles.centerStateText}>Cargando tus órdenes…</AppText>
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
        icon="document-text-outline"
        title="Aún no tienes órdenes"
        description="Cuando tengas exámenes validados, vas a poder descargar el PDF de cada orden aquí."
      />
    );
  }

  return (
    <View style={{ gap: s(12) }}>
      {state.data.map((order) => (
        <OrderPdfCard
          key={order.id}
          order={order}
          downloading={downloadingNumber === order.orderNumber}
          disabled={downloadingNumber !== null}
          onDownload={() => onDownload(order)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  subtitle: { color: colors.textSecondary },
  folderRow: { marginTop: 4 },
  link: { color: colors.primaryBright },
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  centerStateText: { color: colors.textSecondary, fontSize: 12 },
  retryText: { color: colors.primaryBright, textDecorationLine: 'underline' },
});
