import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library
import HomeStack from './screens/HomeStack';
import DictionaryStack from './screens/DictionaryStack';
import PracticeStack from './screens/PracticeStack';

// Header is handled by the individual stacks
const HomeTabs = createBottomTabNavigator({
  screens: {
    Lessons: {
      screen: HomeStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon name="leanpub" color={color} size={size} />
        ),
      },
    },
    Practice: {
      screen: PracticeStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Icon name="pencil" color={color} size={size} />
        ),
        headerShown: false,
      },
    },
    Dictionary: {
      // Assuming you have a Dictionary component
      screen: DictionaryStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Icon name="book" color={color} size={size} />
        ),
        headerShown: false,
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        headerShown: false,
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
