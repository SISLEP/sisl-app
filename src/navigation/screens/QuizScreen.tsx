import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import FillInTheBlankScreen from './FillInTheBlankScreen';
import MatchingPairsScreen from './MatchingPairsScreen';
import SequencingScreen from './SequencingScreen';
import TranslationScreen from './TranslationScreen';

// Helper function to shuffle an array (Fisher-Yates)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// **CORRECTED** function to generate quiz lessons using the available words
const generateQuizLessons = (words) => {
    if (!words || words.length < 7) {
        return [{ type: 'error', data: { message: 'Not enough words to generate a quiz.' } }];
    }

    const lessons = [];
    const shuffledWords = shuffleArray([...words]); // Copy and shuffle all 7 words for mix-and-match

    // --- Lesson 1: Translation (Word 1 vs. 3 random decoys) ---
    const word1 = shuffledWords[0];
    const translationOptions1 = shuffleArray([
        word1.word,
        shuffledWords[1].word,
        shuffledWords[2].word,
        shuffledWords[3].word,
    ]);
    lessons.push({
        type: 'translation',
        instructions: 'Translate the sign to the correct word.',
        data: {
            signVideo: word1.signVideo, 
            correctAnswer: word1.word,
            options: translationOptions1,
        }
    });

    // --- Lesson 2: Matching Pairs (Word 2 and 3) ---
    const pair1 = [shuffledWords[1], shuffledWords[2]];
    lessons.push({
        type: 'matching_pairs',
        instructions: `Tap the matching pair (${pair1[0].word} & ${pair1[1].word})`,
        data: {
            items: shuffleArray(pair1.map((w, index) => ({
                signVideo: w.signVideo,
                translation: w.word,
                id: (index + 1).toString(),
            }))),
        }
    });
    
    // --- Lesson 3: Translation (Word 4 vs. 3 random decoys) ---
    const word4 = shuffledWords[3];
    const translationOptions2 = shuffleArray([
        word4.word,
        shuffledWords[4].word,
        shuffledWords[5].word,
        shuffledWords[6].word,
    ]);
    lessons.push({
        type: 'translation',
        instructions: 'What is being signed?',
        data: {
            signVideo: word4.signVideo, 
            correctAnswer: word4.word,
            options: translationOptions2,
        }
    });
    
    // --- Lesson 4: Matching Pairs (Word 5 and 6) ---
    const pair2 = [shuffledWords[4], shuffledWords[5]];
    lessons.push({
        type: 'matching_pairs',
        instructions: `Tap the matching pair (${pair2[0].word} & ${pair2[1].word})`,
        data: {
            items: shuffleArray(pair2.map((w, index) => ({
                signVideo: w.signVideo,
                translation: w.word,
                id: (index + 3).toString(),
            }))),
        }
    });
    
    // --- Lesson 5: Translation (Word 7 vs. 3 random decoys) ---
    const word7 = shuffledWords[6];
    const translationOptions3 = shuffleArray([
        word7.word,
        shuffledWords[0].word,
        shuffledWords[1].word,
        shuffledWords[4].word,
    ]);
    lessons.push({
        type: 'translation',
        instructions: 'Guess the correct translation.',
        data: {
            signVideo: word7.signVideo, 
            correctAnswer: word7.word,
            options: translationOptions3,
        }
    });

    // --- Lesson 6: Matching Pairs (Word 1 and 7) ---
    const pair3 = [shuffledWords[0], shuffledWords[6]];
    lessons.push({
        type: 'matching_pairs',
        instructions: `Tap the matching pair (${pair3[0].word} & ${pair3[1].word})`,
        data: {
            items: shuffleArray(pair3.map((w, index) => ({
                signVideo: w.signVideo,
                translation: w.word,
                id: (index + 5).toString(),
            }))),
        }
    });

    return lessons;
};


const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizWords } = route.params;

  const [quizLessons, setQuizLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    if (quizWords && quizWords.length >= 7) {
        const lessons = generateQuizLessons(quizWords);
        setQuizLessons(lessons);
    } else {
        Alert.alert('Error', 'Cannot start quiz: at least 7 words are required.');
        navigation.goBack();
    }
  }, [quizWords, navigation]);

  const currentLesson = quizLessons[currentLessonIndex];

  const handleNextLesson = useCallback(() => {
    const nextIndex = currentLessonIndex + 1;
    
    if (nextIndex < quizLessons.length) {
      setCurrentLessonIndex(nextIndex);
    } else {
      // End of quiz, navigate to a completion screen or back home
      Alert.alert('Quiz Complete! 🎉', `You have finished the quiz with ${quizLessons.length} questions.`);
      navigation.goBack(); 
    }
  }, [currentLessonIndex, quizLessons.length, navigation]);

  const renderLessonComponent = () => {
    if (!currentLesson) return <Text style={{ padding: 20 }}>Loading quiz...</Text>;

    const uniqueKey = `quiz-lesson-${currentLesson.type}-${currentLessonIndex}`;

    // Pass the relevant data structure to the lesson components
    switch (currentLesson.type) {
      case 'matching_pairs':
        // Note: For matching pairs, 'data' should contain { items: [...] }
        return <MatchingPairsScreen key={uniqueKey} data={currentLesson.data} instructions={currentLesson.instructions} onNext={handleNextLesson} />;
      case 'translation':
        // Note: For translation, 'data' should contain { signVideo, correctAnswer, options }
        return <TranslationScreen key={uniqueKey} data={currentLesson.data} instructions={currentLesson.instructions} onNext={handleNextLesson} />;
      // Sequencing and Fill-in-the-Blank are not generated here yet, but left for future expansion.
      case 'sequencing':
      case 'fill_in_the_blank':
        return <Text style={{ padding: 20 }}>{currentLesson.type} is not yet implemented in the quiz generator.</Text>;
      default:
        return <Text style={{ padding: 20 }}>Quiz lesson type not recognized: {currentLesson.type}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderLessonComponent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  }
});

export default QuizScreen;