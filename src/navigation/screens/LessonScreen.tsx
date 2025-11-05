import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FillInTheBlankScreen from './FillInTheBlankScreen';
import MatchingPairsScreen from './MatchingPairsScreen';
import SequencingScreen from './SequencingScreen';
import TranslationScreen from './TranslationScreen';
import { saveWordMemory } from '../../storage/memoryService'; // 1. Import saveWordMemory
import { Word } from '../../data/word'; // 2. Import Word type (assuming path is correct)

const PROGRESS_STORAGE_KEY = 'userProgress';

// Helper type to safely access word string from various data structures
type LessonDataItem = { word?: string } | Word | string;

// 3. Function to safely extract words from various lesson data structures
const extractWordsFromLessonData = (data: any): string[] => {
  if (!data) return [];
  
  // Assuming 'data' is an array of items, each containing a 'word' property
  if (Array.isArray(data)) {
    return data
      .map((item: LessonDataItem) => {
        // Handle objects with a 'word' property
        if (typeof item === 'object' && item !== null && 'word' in item && typeof item.word === 'string') {
          return item.word;
        }
        // Handle the case where the array contains just the word strings
        if (typeof item === 'string') {
          return item;
        }
        // Handle the explicit Word type if necessary, assuming it matches { word: string }
        if ('word' in item && typeof (item as Word).word === 'string') {
          return (item as Word).word;
        }
        return null;
      })
      .filter((word): word is string => word !== null && word.trim() !== '');
  }

  // Fallback for non-array data structure (less common for lessons but good for safety)
  if (typeof data === 'object' && 'word' in data && typeof data.word === 'string') {
      return [data.word];
  }

  return [];
};

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
    // 4. Word Memory Saving Logic
    if (currentLesson) {
      const wordsToSave = extractWordsFromLessonData(currentLesson.data);
      console.log('Words to save as Badly remembered:', wordsToSave);
      
      // Save each word with the 'Badly' rating as requested
      const memoryPromises = wordsToSave.map(wordId => 
        saveWordMemory(wordId, 'Badly')
      );
      await Promise.all(memoryPromises);
      console.log(`Saved ${wordsToSave.length} words with 'Badly' rating to memory service.`);
    }
    // End of Word Memory Saving Logic

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
    <View style={styles.container}>
      {renderLessonComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default LessonScreen;