import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { colors } from '../../theme';

interface AvatarProps {
  size: number;
  /** Foto del usuario. Si no se envía se muestra un ícono por defecto. */
  source?: ImageSourcePropType;
  tone?: 'user' | 'assistant';
  ring?: boolean;
}

/**
 * Avatar circular con anillo opcional.
 * Para usar fotos reales: guardarlas en `src/assets/images` y pasarlas en `source`.
 */
export function Avatar({ size, source, tone = 'user', ring = true }: AvatarProps) {
  const inner = ring ? size - 6 : size;
  const background = tone === 'assistant' ? '#B8651B' : '#2A4E7C';

  return (
    <View
      style={[
        styles.outer,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
      ]}
      accessibilityIgnoresInvertColors
    >
      {source ? (
        <Image source={source} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: background },
          ]}
        >
          <Ionicons
            name={tone === 'assistant' ? 'headset' : 'person'}
            size={inner * 0.5}
            color="rgba(255,255,255,0.85)"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    borderWidth: 2,
    borderColor: colors.primaryBright,
    shadowColor: colors.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
