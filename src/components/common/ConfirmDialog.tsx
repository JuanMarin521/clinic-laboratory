import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from './AppText';
import { GradientButton } from './GradientButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Ícono sobre el título (por defecto, una advertencia). */
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación con los colores de la app (reemplaza al Alert nativo, que no
 * se puede personalizar). Tocar fuera del cuadro o el botón "atrás" de Android cancelan.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  icon = 'alert-circle-outline',
  iconColor = colors.warning,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { s } = useResponsive();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Cerrar">
        {/* Pressable interno: evita que un toque dentro del cuadro lo cierre. */}
        <Pressable
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[styles.dialog, { padding: s(22), gap: s(14) }]}
        >
          <View style={[styles.iconBox, { width: s(52), height: s(52), borderColor: iconColor }]}>
            <Ionicons name={icon} size={s(26)} color={iconColor} />
          </View>

          <AppText weight="bold" accessibilityRole="header" style={[styles.center, { fontSize: s(17) }]}>
            {title}
          </AppText>
          <AppText style={[styles.center, styles.message, { fontSize: s(13), lineHeight: s(19) }]}>{message}</AppText>

          <View style={{ gap: s(10), marginTop: s(4) }}>
            <GradientButton label={confirmLabel} onPress={onConfirm} />
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              style={({ pressed }) => [styles.cancel, { height: s(46) }, pressed && styles.pressed]}
            >
              <AppText weight="semibold" style={[styles.cancelText, { fontSize: s(13) }]}>
                {cancelLabel}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 6, 16, 0.75)',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  iconBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  center: { textAlign: 'center' },
  message: { color: colors.textSecondary },
  cancel: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: { color: colors.textSecondary },
  pressed: { opacity: 0.7 },
});
