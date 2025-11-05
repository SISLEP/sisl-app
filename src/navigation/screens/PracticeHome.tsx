// PracticeHome.tsx

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getWordsForSession, getAllWordsLearned } from '../../storage/memoryService'; 
import { fetchAllWords } from '../../api/fetch';
import { Word } from '../../data/word';

const FLASHCARD_COUNT = 10;
const QUIZ_WORD_COUNT = 7; // As required by QuizScreen's generator logic

export function PracticeHome() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const startPractice = async (type: 'flashcards' | 'quiz') => {
    setIsLoading(true);
    try {
      // 1. Fetch all available words from the dictionary
      const allWords: Word[] = await fetchAllWords();
      
      if (!allWords || allWords.length === 0) {
        Alert.alert("No Words", "There are no words available for practice.");
        return;
      }

      // 2. Fetch all word IDs that the user has already learned (i.e., those in memory)
      const learnedWordIds = await getAllWordsLearned();
      
      // 3. Filter the dictionary to create a list of known words
      const knownWords = allWords.filter(word => 
        learnedWordIds.includes(word.word)
      );
      
      if (knownWords.length === 0) {
        Alert.alert("Start Learning!", "You need to complete lessons to start practicing. No words have been learned yet.");
        return;
      }

      const requiredCount = type === 'flashcards' ? FLASHCARD_COUNT : QUIZ_WORD_COUNT;
      
      // 4. Get the words for the session from the list of known words, prioritized by memory score
      const sessionWords = await getWordsForSession(knownWords, requiredCount);

      if (sessionWords.length < requiredCount) {
        Alert.alert(
          "Not Enough Words", 
          `Only ${sessionWords.length} word(s) are in your learned vocabulary. ${type === 'quiz' ? 'The quiz requires at least 7 words.' : `The session requires ${requiredCount} words.`}`
        );
        // We still proceed if we have at least one word, but we warn the user.
        if (sessionWords.length === 0) return;
      }

      // 5. Navigate to the appropriate screen
      if (type === 'flashcards') {
        navigation.navigate('FlashcardScreen', { flashcardWords: sessionWords });
      } else { // 'quiz'
        navigation.navigate('QuizScreen', { quizWords: sessionWords });
      }

    } catch (error) {
      console.error(`Failed to start ${type}:`, error);
      Alert.alert('Error', `Failed to load words for ${type}.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={{ marginTop: 10 }}>Loading practice words...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Icons Section */}
      <View style={styles.iconsContainer}>
        {/* Quiz Icon */}
        <View style={styles.iconItem}>
          {/* Using a placeholder for the specific 'Quiz' bubble icon */}
          <Text style={styles.iconEmoji}>💬❓</Text> 
          <Text style={styles.iconLabel}>Quiz</Text>
        </View>

        {/* Flashcards Icon */}
        <View style={styles.iconItem}>
          {/* Using a placeholder for the specific 'Flashcards' icon */}
          <Text style={styles.iconEmoji}>🎴😊</Text>
          <Text style={styles.iconLabel}>Flashcards</Text>
        </View>
      </View>
      
      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          Take our quiz to test your knowledge.
        </Text>
        <Text style={styles.descriptionText}>
          Or test your recall with flashcards.
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.quizButton]}
          onPress={() => startPractice('quiz')}
        >
          <Text style={styles.buttonText}>Start quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.flashcardButton]}
          onPress={() => startPractice('flashcards')}
        >
          <Text style={styles.buttonText}>Start flashcards</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 40,
  },
  iconItem: {
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 50, // Making the emoji big to simulate the image size
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  descriptionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  quizButton: {
    backgroundColor: '#B2EBF2', // Light Cyan/Blue for Quiz
  },
  flashcardButton: {
    backgroundColor: '#FFD166', // Amber/Orange for Flashcards
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});