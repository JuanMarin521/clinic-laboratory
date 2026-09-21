import type { Exam, ExamStatus } from '../types/exam';

/** Cuenta cuántos exámenes hay por cada estado. */
export function countByStatus(exams: Exam[]): Record<ExamStatus, number> {
  const counts: Record<ExamStatus, number> = { ready: 0, processing: 0, issue: 0 };
  exams.forEach((exam) => {
    counts[exam.status] += 1;
  });
  return counts;
}
