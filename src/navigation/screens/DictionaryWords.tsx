// screens/DictionaryWords.tsx

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DictionaryWords = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, words: categoryWords } = route.params;

  const [words, setWords] = useState([]);

  useEffect(() => {
    // Use the words passed from the previous screen
    setWords(categoryWords.sort((a, b) => a.word.localeCompare(b.word)));
    navigation.setOptions({ title: category });
  }, [category, navigation, categoryWords]);

  const handleWordPress = (index) => {
    // Navigate to the new SignDetailsScreen and pass the word details
    navigation.navigate('SignDetails', {
      category: category,
      initialIndex: index,
      words: words, // Pass the sorted words array
    });
  };

  const renderWordItem = (wordItem, index) => (
    <TouchableOpacity
      key={wordItem.word}
      style={styles.wordItem}
      onPress={() => handleWordPress(index)}
    >
      <Text style={styles.wordText}>{wordItem.word}</Text>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Placeholder for Quiz/Flashcards from screenshot */}
        <View style={styles.utilitySection}>
          <TouchableOpacity style={styles.utilityCard}>
            <Text>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityCard}>
            <Text>Flashcards</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>Signs in collection</Text>
        {words.map((word, index) => renderWordItem(word, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
  },
  utilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  utilityCard: {
    width: '48%',
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E6F0F4',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

export default DictionaryWords;