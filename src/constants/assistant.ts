import type { ImageSourcePropType } from 'react-native';

/**
 * Identidad del asistente del chat: Polito, el pingüino mascota del Centro Policlínico del Olaya.
 * Centralizado aquí para que el nombre y la foto se cambien en un solo lugar.
 */
export const ASSISTANT = {
  name: 'Polito',
  role: 'Asistente virtual del CPO',
  avatar: require('../assets/images/polito.png') as ImageSourcePropType,
} as const;
