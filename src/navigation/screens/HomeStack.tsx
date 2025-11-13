import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Assuming you will have a screen component named Home
// You may need to create this file: ./Home.tsx
import Home from './Home'; 
import CategoryModulesScreen from './CategoryModulesScreen';
import LessonScreen from './LessonScreen';
import LessonCompleteScreen from './LessonCompleteScreen';
// Create a new stack navigator instance
const HomeStack = createNativeStackNavigator();

/**
 * Defines the stack navigator for the '' tab.
 * This stack includes the home screen for practices, and its sub-screens like Quiz and Flashcards.
 */
const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home', // Title for the main screen in the tab
        }}
      />
      <HomeStack.Screen
        name="CategoryModulesScreen"
        component={CategoryModulesScreen}
        options={({ route }) => ({
          title: route.params?.categoryTitle || 'Modules',
        })}
      />
      <HomeStack.Screen
        name="LessonScreen"
        component={LessonScreen}
        options={{
          title: 'Lesson',
        }}
      />
      <HomeStack.Screen
        name="LessonComplete"
        component={LessonCompleteScreen}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackScreen;
