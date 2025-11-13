import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Assuming you will have a screen component named PracticeHome
// You may need to create this file: ./PracticeHome.tsx
import { PracticeHome } from './PracticeHome'; 
import QuizScreen from './QuizScreen';
import FlashcardScreen from './FlashcardScreen';

// Create a new stack navigator instance
const PracticeStack = createNativeStackNavigator();

/**
 * Defines the stack navigator for the 'Practice' tab.
 * This stack includes the home screen for practices, and its sub-screens like Quiz and Flashcards.
 */
const PracticeStackScreen = () => {
  return (
    <PracticeStack.Navigator>
      <PracticeStack.Screen
        name="PracticeHome"
        component={PracticeHome}
        options={{
          title: 'Practice', // Title for the main screen in the tab
        }}
      />
      <PracticeStack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={({ route }) => ({
          title: `${route.params?.category || 'General'} Quiz`,
        })}
      />
      <PracticeStack.Screen
        name="FlashcardScreen"
        component={FlashcardScreen}
        options={{
          title: 'Flashcards',
        }}
      />
    </PracticeStack.Navigator>
  );
};

export default PracticeStackScreen;