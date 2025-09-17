import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DictionaryCategories from './DictionaryCategories';
import DictionaryWords from './DictionaryWords';

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
  },
});

export default DictionaryStack;