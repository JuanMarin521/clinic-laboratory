/** Familias tipográficas (Outfit, cargadas con @expo-google-fonts/outfit). */
export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export type FontWeightName = keyof typeof fonts;
