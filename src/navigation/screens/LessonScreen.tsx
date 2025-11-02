import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FillInTheBlankScreen from './FillInTheBlankScreen';
import MatchingPairsScreen from './MatchingPairsScreen';
import SequencingScreen from './SequencingScreen';
import TranslationScreen from './TranslationScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROGRESS_STORAGE_KEY = 'userProgress';

const LessonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lessons, initialLessonIndex, moduleId } = route.params;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex || 0);
  const currentLesson = lessons[currentLessonIndex];

  // This useEffect ensures the component's state is reset when the user navigates back to it
  // with a new starting index (e.g., when retaking a completed module).
  useEffect(() => {
    setCurrentLessonIndex(initialLessonIndex);
  }, [initialLessonIndex]);

  // This effect will run when the component mounts and when route params change
  useEffect(() => {
    // Check if the user is explicitly retaking a completed module
    if (initialLessonIndex === 0 && currentLessonIndex === 0) {
      const resetProgress = async () => {
        try {
          const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
          if (storedProgress) {
            const progress = JSON.parse(storedProgress);
            // Only reset if the module was previously completed
            if (progress[moduleId] && progress[moduleId].lessonsCompleted >= progress[moduleId].totalLessons) {
              progress[moduleId] = {
                lessonsCompleted: 0,
                totalLessons: lessons.length,
              };
              await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
              console.log(`Progress for module ${moduleId} has been reset for retake.`);
            }
          }
        } catch (e) {
          console.error('Failed to reset progress for retake', e);
        }
      };
      resetProgress();
    }
  }, [initialLessonIndex, moduleId]);

  // Function to save progress to AsyncStorage
  const saveProgress = async (lessonsCompleted) => {
    try {
      const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      const progress = storedProgress ? JSON.parse(storedProgress) : {};
      
      progress[moduleId] = {
        lessonsCompleted,
        totalLessons: lessons.length
      };
      
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      console.log(`Progress for module ${moduleId} saved: ${lessonsCompleted}/${lessons.length}`);
    } catch (e) {
      console.error('Failed to save progress to storage', e);
    }
  };


  const handleNextLesson = async () => {
    const nextLessonIndex = currentLessonIndex + 1;
    await saveProgress(nextLessonIndex);
    
    if (nextLessonIndex < lessons.length) {
      setCurrentLessonIndex(nextLessonIndex);
    } else {
      // End of module, navigate to the completion screen
      navigation.navigate('LessonComplete');
    }
  };

  const renderLessonComponent = () => {
    if (!currentLesson) return <Text>No lesson data available.</Text>;
    
    // Add a unique key to force a re-mount and state reset when the lesson index changes
    const uniqueKey = `${currentLesson.type}-${currentLessonIndex}`;

    switch (currentLesson.type) {
      case 'matching_pairs':
        return <MatchingPairsScreen key={uniqueKey} data={currentLesson.data} onNext={handleNextLesson} />;
      case 'sequencing':
        return <SequencingScreen key={uniqueKey} data={currentLesson.data} onNext={handleNextLesson} />;
      case 'translation':
        return <TranslationScreen key={uniqueKey} data={currentLesson.data} instructions={currentLesson.instructions} onNext={handleNextLesson} />;
      case 'fill_in_the_blank':
        return <FillInTheBlankScreen key={uniqueKey} data={currentLesson.data} onNext={handleNextLesson} />;
      default:
        return <Text>Unknown lesson type: {currentLesson.type}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderLessonComponent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default LessonScreen;
