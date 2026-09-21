import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { AttentionScreen } from '../screens/AttentionScreen';
import { ExamPdfScreen } from '../screens/ExamPdfScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Barra inferior: Resultados · Examen PDF · Atención. */
export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Results"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bgTop },
      }}
    >
      <Tab.Screen name="Results" component={HomeScreen} options={{ title: 'Resultados' }} />
      <Tab.Screen name="ExamPdf" component={ExamPdfScreen} options={{ title: 'Examen PDF' }} />
      <Tab.Screen name="Attention" component={AttentionScreen} options={{ title: 'Atención' }} />
    </Tab.Navigator>
  );
}
