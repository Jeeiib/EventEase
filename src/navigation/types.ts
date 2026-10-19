// Routes de l'app et leurs paramètres, partagés par les navigateurs et les écrans.
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Events: { deletedTitle?: string } | undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  EventDetail: { eventId: number };
  EventForm: { eventId?: number };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;

// Un onglet peut aussi ouvrir les écrans de la pile racine (fiche, formulaire).
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Permet à useNavigation() de connaître les routes sans annotation dans chaque écran.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
