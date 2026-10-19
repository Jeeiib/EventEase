// Chargement de la police Geist.
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';

// Une police qui échoue ne doit jamais bloquer l'app : on retombe sur la police système.
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold });
  return loaded || !!error;
}
