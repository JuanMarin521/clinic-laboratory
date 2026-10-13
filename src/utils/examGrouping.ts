import type { Exam, ExamSection } from '../types/exam';

/**
 * Agrupa la lista plana de exámenes que devuelve la API en secciones por fecha,
 * igual que mostraba antes el diseño con datos de prueba: la fecha más reciente
 * se muestra como "RECIENTES" y el resto se agrupa bajo "SEMANA PASADA".
 *
 * Esta función vive en el frontend porque es puramente de presentación
 * (el backend solo conoce la fecha de cada examen, no cómo agruparlas en pantalla).
 */
export function groupExamsIntoSections(exams: Exam[]): ExamSection[] {
  if (exams.length === 0) return [];

  const mostRecentDate = exams[0].takenDate;
  const recent: Exam[] = [];
  const older: Exam[] = [];

  exams.forEach((exam) => {
    (exam.takenDate === mostRecentDate ? recent : older).push(exam);
  });

  const sections: ExamSection[] = [{ id: 'recent', title: 'RECIENTES', data: recent }];
  if (older.length > 0) {
    sections.push({ id: 'older', title: 'SEMANA PASADA', data: older });
  }

  return sections;
}
