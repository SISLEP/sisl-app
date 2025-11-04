// screens/DictionaryWords.tsx

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getWordsForSession } from '../../storage/memoryService'; // Import the memory service
import { Word } from '../../data/word'; // Assuming Word type is defined here

const DictionaryWords = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, words: categoryWords } = route.params as {
    category: string;
    words: Word[];
  } || {
    category: '',
    words: [],
  };

  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    // Assuming categoryWords is an array of Word objects
    const sortedWords = [...categoryWords].sort((a, b) =>
      a.word.localeCompare(b.word),
    );
    setWords(sortedWords);
    navigation.setOptions({ title: category });
  }, [category, navigation, categoryWords]);

  const handleQuizPress = async () => {
    if (words.length < 7) {
      Alert.alert(
        'Not Enough Words',
        `You need at least 7 words in this category to start a quiz. Only ${words.length} available.`,
      );
      return;
    }

    // Use the memory service to get 7 words, prioritizing least-known
    const quizWords = await getWordsForSession(words, 7);
    // Assuming 'QuizScreen' exists and can handle quizWords
    navigation.navigate('QuizScreen' as never, {
      quizWords: quizWords,
      category: category,
    } as never);
  };

  const handleFlashcardsPress = async () => {
    if (words.length < 7) {
      Alert.alert(
        'Not Enough Words',
        `You need at least 7 words in this category to start flashcards. Only ${words.length} available.`,
      );
      return;
    }

    // Use the memory service to get 7 words
    const flashcardWords = await getWordsForSession(words, 7);
    // Assuming 'FlashcardScreen' exists
    navigation.navigate('FlashcardScreen' as never, {
      flashcardWords: flashcardWords,
      category: category,
    } as never);
  };

  const handleWordPress = (index: number) => {
    navigation.navigate('SignDetails' as never, {
      category: category,
      initialIndex: index,
      words: words,
    } as never);
  };

  const renderWordItem = (wordItem: Word, index: number) => (
    <TouchableOpacity
      key={wordItem.id || wordItem.word} // Use a unique id if available
      style={styles.wordItem}
      onPress={() => handleWordPress(index)}
    >
      <Text style={styles.wordText} numberOfLines={1} ellipsizeMode="tail">
        {wordItem.word}
      </Text>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.utilitySection}>
          <TouchableOpacity style={styles.utilityCard} onPress={handleQuizPress}>
            <Text style={styles.utilityCardText}>Quiz</Text>
          </TouchableOpacity>
          {/* Updated to call handleFlashcardsPress */}
          <TouchableOpacity
            style={styles.utilityCard}
            onPress={handleFlashcardsPress}
          >
            <Text style={styles.utilityCardText}>Flashcards</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>Signs in collection</Text>
        {words.map((word, index) => renderWordItem(word, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  utilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  utilityCard: {
    width: '48%',
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E6F0F4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  utilityCardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  wordText: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
});

export default DictionaryWords;
