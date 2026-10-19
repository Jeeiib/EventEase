// Barre d'onglets de l'utilisateur connecté : Événements, Calendrier, Profil.
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { colors, font } from '@/theme/tokens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = React.ComponentProps<typeof Feather>['name'];

function tabIcon(name: IconName) {
  const TabIcon = ({ color }: { color: string }) => <Feather name={name} size={24} color={color} />;
  return TabIcon;
}

export function MainTabs(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.line, borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: font.size.tab },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Events"
        component={PlaceholderScreen}
        options={{ title: t('common.tabs.events'), tabBarAccessibilityLabel: t('common.tabs.events'), tabBarIcon: tabIcon('list') }}
      />
      <Tab.Screen
        name="Calendar"
        component={PlaceholderScreen}
        options={{
          title: t('common.tabs.calendar'),
          tabBarAccessibilityLabel: t('common.tabs.calendar'),
          tabBarIcon: tabIcon('calendar'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{ title: t('common.tabs.profile'), tabBarAccessibilityLabel: t('common.tabs.profile'), tabBarIcon: tabIcon('user') }}
      />
    </Tab.Navigator>
  );
}
