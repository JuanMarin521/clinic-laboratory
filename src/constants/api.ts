/**
 * Configuracion de conexion con el backend (CPO Conecta API).
 *
 * IMPORTANTE: en un celular o emulador, "localhost" apunta al propio dispositivo,
 * NO a tu computador. Por eso, para probar en un telefono fisico con Expo Go,
 * reemplaza esta URL por la IP local de tu computador en la misma red Wi-Fi,
 * por ejemplo: "http://192.168.1.10:4000/api/v1" (puedes verla con `ipconfig`).
 *
 * Si usas un emulador de Android, "10.0.2.2" apunta al localhost de tu computador.
 */
//export const API_BASE_URL = 'http://localhost:4000/api/v1';
//url pc pablo
export const API_BASE_URL = 'http://172.20.10.4:4000/api/v1';

/** Tiempo maximo (en milisegundos) que se espera la respuesta de una peticion. */
export const API_TIMEOUT_MS = 10000;
