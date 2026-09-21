import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import type { MainTabScreenProps } from '../navigation/types';
import { gradients } from '../theme';

/**
 * Pestaña "Examen PDF": aún no tiene diseño en Figma.
 * Se deja una pantalla provisional para que la barra inferior sea 100% navegable.
 */
export function ExamPdfScreen(_props: MainTabScreenProps<'ExamPdf'>) {
  return (
    <ScreenContainer gradient={gradients.home} edges={['top']} contentStyle={{ justifyContent: 'center' }}>
      <PlaceholderMessage
        icon="document-text-outline"
        title="Examen PDF"
        description="Aquí podrás consultar y descargar el resultado de tus exámenes en PDF. Disponible en la siguiente entrega."
      />
    </ScreenContainer>
  );
}
