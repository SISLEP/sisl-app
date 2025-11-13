import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import bell from '../assets/bell.png';
import home from '../assets/home.png';
import book from '../assets/book.png';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library
import CategoryModulesScreen from './screens/CategoryModulesScreen';
import Home from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { NotFound } from './screens/NotFound';
import LessonScreen from './screens/LessonScreen';
import LessonCompleteScreen from './screens/LessonCompleteScreen';
import HomeStack from './screens/HomeStack';
import DictionaryStack from './screens/DictionaryStack';
import PracticeStack from './screens/PracticeStack';

// Header is handled by the individual stacks
const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: HomeStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" color={color} size={size} />
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
        title: 'Dictionary',
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
        title: 'Home',
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
