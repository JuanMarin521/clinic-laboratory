import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';

interface WelcomeHeaderProps {
  name: string;
}

/** Saludo "BIENVENIDO," + nombre del paciente + avatar. */
export function WelcomeHeader({ name }: WelcomeHeaderProps) {
  const { s } = useResponsive();

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <AppText weight="medium" style={[styles.welcome, { fontSize: s(10) }]}>
          BIENVENIDO,
        </AppText>
        <AppText weight="bold" style={{ fontSize: s(20) }} numberOfLines={1}>
          {name}
        </AppText>
      </View>
      <Avatar size={s(44)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 2 },
  welcome: { color: colors.textSecondary, letterSpacing: 1.2 },
});
