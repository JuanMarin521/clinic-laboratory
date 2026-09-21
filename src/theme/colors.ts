/**
 * Paleta de colores de CPO Conecta (tomada de los diseños de Figma).
 * Cualquier color usado en la app debe salir de este archivo.
 */
export const colors = {
  // Fondos
  bgTop: '#040B19',
  bgMid: '#061326',
  bgBottom: '#0A1D3A',

  // Superficies
  surface: '#0D1728',
  surfaceRaised: '#111D32',
  border: '#1C2B45',
  borderSoft: '#15233A',

  // Marca
  primary: '#1F6FE5',
  primaryBright: '#2F80FF',
  cyan: '#0FA9E0',
  cyanBorder: '#1AA3D9',

  // Texto
  textPrimary: '#FFFFFF',
  textSecondary: '#93A0B8',
  textMuted: '#5F6C84',

  // Semáforo de estados
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Teclado numérico (estilo iOS)
  keypadPanel: '#9BA7C0',
  keypadKey: '#E9EDF6',
  keypadKeyText: '#0B1220',

  white: '#FFFFFF',
} as const;

/** Degradados. Se declaran `as const` para que TypeScript los acepte en LinearGradient. */
export const gradients = {
  screen: ['#040B19', '#061326', '#0A1D3A'],
  home: ['#040B19', '#06111F', '#081729'],
  primaryButton: ['#1F6FE5', '#0FA9E0'],
  disabledButton: ['#123563', '#0F4A68'],
  loadingButton: ['#0F2F5C', '#0C3E63'],
} as const;
