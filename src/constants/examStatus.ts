import { colors } from '../theme';
import type { ExamStatus } from '../types/exam';

export interface ExamStatusStyle {
  label: string;
  color: string;
  background: string;
  border: string;
}

/** Semáforo de estados: Listo / En proceso / Con novedad. */
export const EXAM_STATUS: Record<ExamStatus, ExamStatusStyle> = {
  ready: {
    label: 'Listo',
    color: colors.success,
    background: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.45)',
  },
  processing: {
    label: 'En proceso',
    color: colors.warning,
    background: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.45)',
  },
  issue: {
    label: 'Con novedad',
    color: colors.danger,
    background: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.5)',
  },
};

/** Orden en el que se muestran las tarjetas resumen. */
export const EXAM_STATUS_ORDER: ExamStatus[] = ['ready', 'processing', 'issue'];
