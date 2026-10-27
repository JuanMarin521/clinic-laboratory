import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';

interface WelcomeHeaderProps {
  name: string;
  /** Se llama al tocar el avatar (abre la pantalla de Perfil). */
  onAvatarPress: () => void;
}

/** Saludo "BIENVENIDO," + nombre del paciente + avatar (que abre el Perfil). */
export function WelcomeHeader({ name, onAvatarPress }: WelcomeHeaderProps) {
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
      <Pressable
        onPress={onAvatarPress}
        accessibilityRole="button"
        accessibilityLabel="Abrir mi perfil"
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Avatar size={s(44)} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 2 },
  welcome: { color: colors.textSecondary, letterSpacing: 1.2 },
  pressed: { opacity: 0.7 },
});
