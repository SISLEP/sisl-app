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
import DictionaryStack from './screens/DictionaryStack';
import PracticeStack from './screens/PracticeStack';

const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        title: 'Home',
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
    CategoryModulesScreen: {
      screen: CategoryModulesScreen,
      options: ({ route }) => ({
        title: route.params?.categoryTitle || 'Modules',
      }),
    },
    LessonScreen: {
      screen: LessonScreen,
      options: {
        title: 'Lesson',
      },
    },
    LessonComplete: {
      screen: LessonCompleteScreen,
      options: {
        headerShown: false,
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ':user(@[a-zA-Z0-9-_]+)',
        parse: {
          user: (value) => value.replace(/^@/, ''),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
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
