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
import dictionaryData from '../../assets/data/dictionary.json';

const DictionaryWords = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params;
  const [words, setWords] = useState([]);

  useEffect(() => {
    // Filter the JSON data based on the category
    const filteredWords = dictionaryData.filter(
      (item) => item.category === category
    );
    setWords(filteredWords.sort((a, b) => a.word.localeCompare(b.word)));
    navigation.setOptions({ title: category }); // Set header title dynamically
  }, [category, navigation]);

  const renderWordItem = (wordItem) => (
    <TouchableOpacity key={wordItem.word} style={styles.wordItem}>
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
        {words.map(renderWordItem)}
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