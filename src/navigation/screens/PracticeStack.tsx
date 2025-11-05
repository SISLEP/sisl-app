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
          title: 'Practices', // Title for the main screen in the tab
          headerShown: false, // Let the main Tab Navigator handle the header or remove it entirely
        }}
      />
      <PracticeStack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={({ route }) => ({
          title: `${route.params?.category || 'General'} Quiz`,
          headerShown: false,
        })}
      />
      <PracticeStack.Screen
        name="FlashcardScreen"
        component={FlashcardScreen}
        options={{
          title: 'Flashcards',
          headerShown: false,
        }}
      />
    </PracticeStack.Navigator>
  );
};

export default PracticeStackScreen;