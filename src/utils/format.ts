/** Devuelve la hora en formato corto, ej. "9:05". */
export function formatTime(date: Date): string {
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${date.getHours()}:${minutes}`;
}

const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Separa una fecha ISO "YYYY-MM-DD" en sus partes.
 * No se usa `new Date("2026-09-19")` a propósito: esa fecha se interpreta en UTC y en
 * Colombia (UTC-5) se mostraría como el día anterior.
 */
function parseIsoDate(isoDate: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

/** "2026-09-19" -> "19 de septiembre de 2026". */
export function formatLongDate(isoDate: string): string {
  const parts = parseIsoDate(isoDate);
  if (!parts) return isoDate;
  return `${parts.day} de ${MONTHS_LONG[parts.month - 1]} de ${parts.year}`;
}

/** "2026-09-19" -> "19 sep 2026". */
export function formatShortDate(isoDate: string): string {
  const parts = parseIsoDate(isoDate);
  if (!parts) return isoDate;
  return `${parts.day} ${MONTHS_LONG[parts.month - 1].slice(0, 3)} ${parts.year}`;
}
