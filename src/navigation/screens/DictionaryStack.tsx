import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DictionaryCategories from './DictionaryCategories';
import DictionaryWords from './DictionaryWords';
import QuizScreen from './QuizScreen';
import SignDetailsScreen from './SignDetailsScreen';
import FlashcardScreen from './FlashcardScreen';
import SearchScreen from './SearchScreen';

const DictionaryStack = createNativeStackNavigator({
  screens: {
    DictionaryCategories: {
      screen: DictionaryCategories,
      options: {
        title: 'Explore', // Matches the screenshot
        headerShown: false, // The 'HomeTabs' navigator handles the header
      },
    },
    DictionaryWords: {
      screen: DictionaryWords,
      options: {
        title: 'Category', // Will be dynamically set
        headerShown: false
      },
    },
    QuizScreen: {
      screen: QuizScreen,
      options: ({ route }) => ({
        title: `${route.params?.category || ''} Quiz`,
        headerShown: false
      }),
    },
    SignDetails: {
      screen: SignDetailsScreen, // Add the new screen to the stack
      options: {
        headerShown: false,
      },
    },
    FlashcardScreen: {
      screen: FlashcardScreen,
      options: {
        headerShown: false,
      },
    },
    SearchScreen: {
      screen: SearchScreen,
      options: {
        title: 'Search Signs',
        headerShown: false,
      },
    },
  },
});

export default DictionaryStack;