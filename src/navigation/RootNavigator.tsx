// Aiguillage selon la session : pile d'authentification, ou onglets + fiche + formulaire.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/auth/AuthContext';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { colors } from '@/theme/tokens';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { status } = useAuth();
  return (
    // En-têtes maison sur chaque écran ; le geste de retour natif reste actif.
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {status === 'signedIn' ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EventDetail" component={PlaceholderScreen} />
          {/* Sur iOS, « modal » donne la feuille pageSheet qu'on glisse pour fermer. */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="EventForm" component={PlaceholderScreen} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
