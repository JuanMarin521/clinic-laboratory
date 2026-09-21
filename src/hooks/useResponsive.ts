import { useWindowDimensions } from 'react-native';

/** Ancho de diseño de referencia (iPhone de los mockups de Figma). */
const BASE_WIDTH = 390;
/** Ancho máximo de la columna de contenido; en tablets se centra. */
export const MAX_CONTENT_WIDTH = 520;

/**
 * Utilidades para que la interfaz se adapte a cualquier pantalla
 * (iPhone, Android, tablet, portrait o landscape).
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const scale = Math.min(Math.max(contentWidth / BASE_WIDTH, 0.85), 1.2);

  /** Escala un tamaño (px del diseño) según el ancho real disponible. */
  const s = (size: number) => Math.round(size * scale);

  return { width, height, isTablet, isLandscape, contentWidth, s };
}
