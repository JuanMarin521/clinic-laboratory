export type ExamStatus = 'ready' | 'processing' | 'issue';

export interface Exam {
  id: string;
  /** Id interno de la orden a la que pertenece. */
  orderId: string;
  /** Número de orden de 6 dígitos, ej. "546237". */
  orderNumber: string;
  name: string;
  /** Fecha de toma de muestra (la de su orden), formato ISO "YYYY-MM-DD". */
  takenDate: string;
  site: string;
  status: ExamStatus;
}

/**
 * Una orden agrupa los exámenes de una misma visita al laboratorio
 * (un paciente solo puede tener una orden por día).
 */
export interface Order {
  id: string;
  /** Número de orden de 6 dígitos, ej. "546237". Se muestra como "#546237". */
  orderNumber: string;
  /** Fecha de la visita, formato ISO "YYYY-MM-DD". */
  date: string;
  site: string;
  /** Cuántos exámenes de la orden hay en cada estado (semáforo). */
  summary: Record<ExamStatus, number>;
  exams: Exam[];
}

export interface ExamSection {
  id: string;
  title: string;
  data: Exam[];
}
