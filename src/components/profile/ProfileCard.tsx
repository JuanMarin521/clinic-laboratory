import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

interface ProfileCardProps {
  title: string;
  /** Texto del enlace a la derecha del título (ej. "Editar"). */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

/** Tarjeta de sección del Perfil: título en mayúsculas, acción opcional y contenido. */
export function ProfileCard({ title, actionLabel, onAction, children }: ProfileCardProps) {
  const { s } = useResponsive();

  return (
    <View style={{ gap: s(10) }}>
      <View style={styles.titleRow}>
        <AppText weight="medium" accessibilityRole="header" style={[styles.title, { fontSize: s(10) }]}>
          {title}
        </AppText>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
            <AppText weight="semibold" style={[styles.action, { fontSize: s(12) }]}>
              {actionLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.card, { padding: s(14), gap: s(14) }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.textSecondary, letterSpacing: 1.5 },
  action: { color: colors.primaryBright },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
