import { Text, type TextProps } from 'react-native';

import { colors, fonts, type FontWeightName } from '../../theme';

interface AppTextProps extends TextProps {
  weight?: FontWeightName;
}

/** Texto base de la app: aplica la tipografía Outfit y el color por defecto. */
export function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], color: colors.textPrimary }, style]} />;
}
