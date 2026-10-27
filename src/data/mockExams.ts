import type { ExamSection } from '../types/exam';

export const mockExamSections: ExamSection[] = [
  {
    id: 'recent',
    title: 'RECIENTES',
    data: [
      { id: '1', orderId: 'o2', orderNumber: '546237', name: 'Hemograma completo', takenDate: '2026-09-19', site: 'Laureles', status: 'ready' },
      { id: '2', orderId: 'o2', orderNumber: '546237', name: 'Perfil lipídico', takenDate: '2026-09-19', site: 'Laureles', status: 'ready' },
      { id: '3', orderId: 'o2', orderNumber: '546237', name: 'Glicemia basal', takenDate: '2026-09-19', site: 'Laureles', status: 'issue' },
    ],
  },
  {
    id: 'last-week',
    title: 'SEMANA PASADA',
    data: [
      { id: '4', orderId: 'o1', orderNumber: '318904', name: 'Perfil metabólico', takenDate: '2026-09-13', site: 'Laureles', status: 'processing' },
    ],
  },
];
