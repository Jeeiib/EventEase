// Point d'entrée : prépare polices, base et session derrière l'écran de lancement, puis ouvre la navigation.
import '@/i18n';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import type { Db } from '@/db/connection';
import { DbProvider } from '@/db/DbContext';
import { prepareDatabase } from '@/db/startup';
import { RootNavigator } from '@/navigation/RootNavigator';
import { StartupErrorScreen } from '@/screens/StartupErrorScreen';
import { useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, card: colors.background, text: colors.text, border: colors.line },
};

export default function App(): React.JSX.Element | null {
  const fontsReady = useAppFonts();
  const [db, setDb] = useState<Db | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    prepareDatabase().then(
      (ready) => {
        if (!cancelled) setDb(ready);
      },
      () => {
        if (cancelled) return;
        setFailed(true);
        void SplashScreen.hideAsync();
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (!fontsReady) return null;
  if (failed) {
    return (
      <StartupErrorScreen
        onRetry={() => {
          setFailed(false);
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  if (!db) return null;

  return (
    <SafeAreaProvider>
      <DbProvider db={db}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Navigation />
        </AuthProvider>
      </DbProvider>
    </SafeAreaProvider>
  );
}

// L'écran de lancement reste affiché tant que la session n'est pas relue : pas de flash de la connexion.
function Navigation(): React.JSX.Element | null {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null;
  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
