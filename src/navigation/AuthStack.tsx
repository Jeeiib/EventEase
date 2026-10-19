// Pile de l'utilisateur déconnecté : connexion, puis inscription.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { colors } from '@/theme/tokens';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Login" component={PlaceholderScreen} />
      <Stack.Screen name="Register" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}
