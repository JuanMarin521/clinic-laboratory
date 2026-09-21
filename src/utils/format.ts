/** Devuelve la hora en formato corto, ej. "9:05". */
export function formatTime(date: Date): string {
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${date.getHours()}:${minutes}`;
}
