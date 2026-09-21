export type ExamStatus = 'ready' | 'processing' | 'issue';

export interface Exam {
  id: string;
  name: string;
  /** Fecha corta de toma de muestra, ej. "19 sep". */
  takenDate: string;
  site: string;
  status: ExamStatus;
}

export interface ExamSection {
  id: string;
  title: string;
  data: Exam[];
}
