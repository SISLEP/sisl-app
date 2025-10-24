// screens/DictionaryWords.tsx

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DictionaryWords = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, words: categoryWords } = route.params || { category: '', words: [] };

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
      <Text
        style={styles.wordText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {wordItem.word}
      </Text>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    // We use edges={['left', 'right', 'bottom']} to explicitly ignore the top edge
    // which is often handled by the React Navigation header itself, preventing double padding/space.
    <SafeAreaView 
        style={styles.container}
        edges={['left', 'right', 'bottom']}
    >
      {/* ScrollView content starts here */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.utilitySection}>
          <TouchableOpacity style={styles.utilityCard}>
            <Text style={styles.utilityCardText}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityCard}>
            <Text style={styles.utilityCardText}>Flashcards</Text>
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