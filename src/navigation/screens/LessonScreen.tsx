import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FillInTheBlankScreen from './FillInTheBlankScreen';
import MatchingPairsScreen from './MatchingPairsScreen';
import SequencingScreen from './SequencingScreen';
import TranslationScreen from './TranslationScreen';
import ConversationScreen from './ConversationScreen'; // <-- NEW IMPORT
import { addWordMemory } from '../../storage/memoryService';
import { Word } from '../../data/word'; // 2. Import Word type (assuming path is correct)

const PROGRESS_STORAGE_KEY = 'userProgress';

// Helper type to safely access word string from various data structures
type LessonDataItem = { word?: string } | Word | string;

// 3. Function to safely extract words from various lesson data structures
const extractWordsFromLessonData = (data: any, lessonType: string): string[] => {
  console.log('Extracting words from lesson data:', data, 'for type:', lessonType);
  if (!data) return [];
  
  let words: (string | null)[] = [];

  switch (lessonType) {
    case 'matching_pairs':
      // Data format: { "items": [{ "translation": "Word1" }, { "translation": "Word2" }] }
      if (data.items && Array.isArray(data.items)) {
        words = data.items.map((item: { translation?: string }) => 
          item.translation && typeof item.translation === 'string' ? item.translation : null
        );
      }
      break;
    case 'translation':
      // Data format: { "correctAnswer": "Word" }
      if (data.correctAnswer && typeof data.correctAnswer === 'string') {
        words = [data.correctAnswer];
      }
      break;
    case 'sequencing':
    case 'fill_in_the_blank':
    case 'conversation': // <-- ADDED new type
      // Default array extraction logic for other types
      if (Array.isArray(data)) {
        words = data.map((item: LessonDataItem) => {
          // For conversation, we might extract words from both sentences if they contain key words.
          // For simplicity here, we'll assume the full English sentence is the "word" to track memory on.
          if (typeof item === 'object' && item !== null && 'englishSentence' in item && typeof (item as any).englishSentence === 'string') {
            return (item as any).englishSentence;
          }
          if (typeof item === 'object' && item !== null && 'word' in item && typeof item.word === 'string') {
            return item.word;
          }
          if (typeof item === 'string') {
            return item;
          }
          return null;
        });
      }
      // Fallback for non-array data structure (if only one word is expected)
      if (typeof data === 'object' && 'word' in data && typeof data.word === 'string') {
          words = [data.word];
      }
      break;
    default:
      console.warn('Unknown lesson type or missing extraction logic:', lessonType);
      // Fallback to original, generic extraction for safety
      if (Array.isArray(data)) {
        words = data
          .map((item: LessonDataItem) => {
            if (typeof item === 'object' && item !== null && 'word' in item && typeof item.word === 'string') {
              return item.word;
            }
            if (typeof item === 'string') {
              return item;
            }
            if ('word' in item && typeof (item as Word).word === 'string') {
              return (item as Word).word;
            }
            return null;
          });
      }
      break;
  }

  // Filter out nulls and duplicates and return only non-empty strings
  const uniqueWords = Array.from(new Set(
    words.filter((word): word is string => word !== null && word.trim() !== '')
  ));

  return uniqueWords;
};

const LessonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // moduleId now stores the composite key (e.g., "alphabet-1")
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
              progress[moduleId] = { // <-- Uses moduleId (the composite key)
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
  }, [initialLessonIndex, moduleId]); // <-- Uses moduleId in dependencies

  // Function to save progress to AsyncStorage
  const saveProgress = async (lessonsCompleted) => {
    try {
      const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      const progress = storedProgress ? JSON.parse(storedProgress) : {};
      
      progress[moduleId] = { // <-- Uses moduleId (the composite key)
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
      // Pass the lesson type to correctly extract words
      const wordsToSave = extractWordsFromLessonData(currentLesson.data, currentLesson.type);
      console.log('Words to save as Badly remembered:', wordsToSave);
      
      // Use addWordMemory to only add the word if it's not already present.
      // This initializes its score to 0 ('Badly' remembered).
      const memoryPromises = wordsToSave.map(wordId => 
        addWordMemory(wordId)
      );
      await Promise.all(memoryPromises);
      console.log(`Attempted to add ${wordsToSave.length} new words to memory service.`);
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
      case 'conversation': // <-- NEW CASE FOR CONVERSATION
        return <ConversationScreen key={uniqueKey} data={currentLesson.data} onNext={handleNextLesson} />;
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