import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './AppText';

interface PlaceholderMessageProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
}

/** Estado vacío / "próximamente" para secciones que aún no tienen diseño. */
export function PlaceholderMessage({ icon, title, description }: PlaceholderMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={28} color={colors.primaryBright} />
      </View>
      <AppText weight="semibold" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.description}>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 16 },
  description: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
