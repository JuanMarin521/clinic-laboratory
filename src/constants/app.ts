import appConfig from '../../app.json';

export const APP_NAME = 'CPO CONECTA';
export const APP_SUBTITLE = 'Sistema de Gestión de Laboratorio';

/** Versión que se muestra en el pie de las pantallas de ingreso. Sale de app.json para no desactualizarse. */
export const APP_VERSION_LABEL = `CPOConecta v${appConfig.expo.version}`;

/**
 * Si la app pasa más de este tiempo en segundo plano con la sesión abierta, al volver se
 * bloquea: pide la biometría (si está activa) o vuelve al login.
 */
export const INACTIVITY_LOCK_MS = 5 * 60 * 1000;
