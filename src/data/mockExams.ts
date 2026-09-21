import type { ExamSection } from '../types/exam';

export const mockExamSections: ExamSection[] = [
  {
    id: 'recent',
    title: 'RECIENTES',
    data: [
      { id: '1', name: 'Hemograma completo', takenDate: '19 sep', site: 'Loureles', status: 'ready' },
      { id: '2', name: 'Perfil lipídico', takenDate: '19 sep', site: 'Loureles', status: 'ready' },
      { id: '3', name: 'Glisemia basal', takenDate: '19 sep', site: 'Loureles', status: 'issue' },
    ],
  },
  {
    id: 'last-week',
    title: 'SEMANA PASADA',
    data: [
      { id: '4', name: 'Perfil Metabólico', takenDate: '13 sep', site: 'Loureles', status: 'processing' },
    ],
  },
];
