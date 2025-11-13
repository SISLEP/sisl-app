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
        title: 'Dictionary',
      },
    },
    DictionaryWords: {
      screen: DictionaryWords,
      options: {
        title: 'Category', // Will be dynamically set
      },
    },
    QuizScreen: {
      screen: QuizScreen,
      options: ({ route }) => ({
        title: `${route.params?.category || ''} Quiz`,
      }),
    },
    SignDetails: {
      screen: SignDetailsScreen, // Add the new screen to the stack
      options: {
        title: 'Sign Video',
      },
    },
    FlashcardScreen: {
      screen: FlashcardScreen,
      options: {
        title: 'Flashcards',
      },
    },
    SearchScreen: {
      screen: SearchScreen,
      options: {
        title: 'Search Signs',
      },
    },
  },
});

export default DictionaryStack;