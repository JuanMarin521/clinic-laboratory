import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Guardado de los PDF de resultados en el celular.
 *
 * - Android: la primera vez el paciente elige una carpeta (ej. "Descargas"). El sistema le
 *   da a la app permiso permanente SOLO sobre esa carpeta, y desde ahí cada PDF se guarda
 *   directo, sin más pasos. La carpeta se puede cambiar en cualquier momento.
 * - iOS: no permite escribir en carpetas del usuario sin preguntar cada vez, así que se
 *   abre el menú del sistema ("Guardar en Archivos", enviar, abrir...). El PDF temporal
 *   se borra al cerrar ese menú, porque los resultados médicos son datos sensibles.
 */

/** Resultado de un intento de guardado. */
export type PdfSaveResult =
  | { status: 'saved'; folderName: string }
  | { status: 'shared' }
  | { status: 'cancelled' };

const PDF_MIME_TYPE = 'application/pdf';
/** Archivo (dentro de la app) donde se recuerda la carpeta elegida en Android. No es un dato sensible. */
const FOLDER_SETTING = new File(Paths.document, 'download-folder.json');
const TEMP_FOLDER_NAME = 'resultados';

/** `true` si la persona cerró el selector de carpeta sin elegir una. */
function isPickerCancelled(error: unknown): boolean {
  return error instanceof Error && /cancel/i.test(error.message);
}

function readSavedFolder(): Directory | null {
  try {
    if (!FOLDER_SETTING.exists) return null;
    const { uri } = JSON.parse(FOLDER_SETTING.textSync()) as { uri?: string };
    return uri ? new Directory(uri) : null;
  } catch {
    return null;
  }
}

function rememberFolder(folder: Directory): void {
  FOLDER_SETTING.write(JSON.stringify({ uri: folder.uri }));
}

function forgetFolder(): void {
  try {
    if (FOLDER_SETTING.exists) FOLDER_SETTING.delete();
  } catch {
    // Si no se pudo borrar, se reemplaza la próxima vez que se elija una carpeta.
  }
}

/** Abre el selector de carpetas de Android. `null` si la persona canceló. */
async function pickFolder(): Promise<Directory | null> {
  try {
    const folder = await Directory.pickDirectoryAsync();
    rememberFolder(folder);
    return folder;
  } catch (error) {
    if (isPickerCancelled(error)) return null;
    throw error;
  }
}

function writePdf(folder: Directory, fileName: string, bytes: Uint8Array): void {
  // Si ya existe un archivo con ese nombre, Android agrega " (1)", " (2)"... automáticamente.
  const file = folder.createFile(fileName, PDF_MIME_TYPE);
  file.write(bytes);
}

/** `true` si en este celular el PDF se guarda en una carpeta (Android) y no con el menú de compartir. */
export const savesToFolder = Platform.OS === 'android';

/** Nombre de la carpeta de descargas elegida (Android), o `null` si aún no hay una. */
export function getDownloadFolderName(): string | null {
  return savesToFolder ? (readSavedFolder()?.name ?? null) : null;
}

/** Deja elegir otra carpeta de descargas (Android). Devuelve su nombre, o `null` si se canceló. */
export async function changeDownloadFolder(): Promise<string | null> {
  const folder = await pickFolder();
  return folder?.name ?? null;
}

async function saveToFolder(fileName: string, bytes: Uint8Array): Promise<PdfSaveResult> {
  const saved = readSavedFolder();
  if (saved) {
    try {
      writePdf(saved, fileName, bytes);
      return { status: 'saved', folderName: saved.name };
    } catch {
      // La carpeta ya no existe o se quitó el permiso: se olvida y se pide otra.
      forgetFolder();
    }
  }

  const folder = await pickFolder();
  if (!folder) return { status: 'cancelled' };
  writePdf(folder, fileName, bytes);
  return { status: 'saved', folderName: folder.name };
}

async function shareTemporaryPdf(fileName: string, bytes: Uint8Array): Promise<PdfSaveResult> {
  const folder = new Directory(Paths.cache, TEMP_FOLDER_NAME);
  folder.create({ idempotent: true });
  const file = new File(folder, fileName);
  try {
    if (file.exists) file.delete();
    file.write(bytes);
    await Sharing.shareAsync(file.uri, { mimeType: PDF_MIME_TYPE, UTI: 'com.adobe.pdf', dialogTitle: fileName });
    return { status: 'shared' };
  } finally {
    clearTemporaryPdfs();
  }
}

/** Guarda un PDF según la plataforma (ver explicación arriba). */
export function savePdf(fileName: string, bytes: Uint8Array): Promise<PdfSaveResult> {
  return savesToFolder ? saveToFolder(fileName, bytes) : shareTemporaryPdf(fileName, bytes);
}

/** Borra los PDF temporales (ej. restos de una sesión anterior). Nunca falla. */
export function clearTemporaryPdfs(): void {
  try {
    const folder = new Directory(Paths.cache, TEMP_FOLDER_NAME);
    if (folder.exists) folder.delete();
  } catch {
    // Se intentará de nuevo en la siguiente descarga.
  }
}
