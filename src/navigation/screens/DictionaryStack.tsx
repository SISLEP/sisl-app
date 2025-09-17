import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DictionaryCategories from './DictionaryCategories';
import DictionaryWords from './DictionaryWords';
import SignDetailsScreen from './SignDetailsScreen';

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
      },
    },
    SignDetails: {
      screen: SignDetailsScreen, // Add the new screen to the stack
      options: {
        headerShown: false, // Hide header on this screen for a cleaner look
      },
    },
  },
});

export default DictionaryStack;