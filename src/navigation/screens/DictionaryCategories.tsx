// screens/DictionaryCategories.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchDictionaryData, DictionaryData } from '../../api/fetch'; 

const DictionaryCategories = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<string[]>([]);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData>({});
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Function to fetch and process the dictionary data
  const loadDictionaryData = async () => {
    setIsLoading(true);
    try {
      // Use the refactored fetch function
      const data = await fetchDictionaryData();
      setDictionaryData(data);
      // Extract unique categories from the fetched data keys
      const uniqueCategories = Object.keys(data);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load dictionary data:', error);
      Alert.alert('Error', 'Failed to load dictionary. Please check your network connection.');
      setCategories([]); // Clear categories on fetch failure
      setDictionaryData({});
    } finally {
      setIsLoading(false);
    }
  };

  // Use useFocusEffect to reload data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadDictionaryData();
    }, [])
  );


  const handleCategoryPress = (category: string) => {
    // Pass the list of words for the selected category to the next screen
    const categoryWords = dictionaryData[category] || [];
    if (categoryWords.length === 0) {
      Alert.alert('No Words', `The category "${category}" has no words yet.`);
      return;
    }

    navigation.navigate('DictionaryWords' as never, {
      category: category,
      words: categoryWords,
    } as never);
  };

  const renderCategoryCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      {/* You'll need to add logic for icons and dynamic backgrounds */}
      <Text style={styles.categoryTitle}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TextInput style={styles.searchBar} placeholder="Search for signs or collections" />
        <View style={styles.tabContainer}>
          <Text style={styles.activeTab}>Public</Text>
          <Text style={styles.inactiveTab}>My collections</Text>
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF9500" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item}
            numColumns={2}
            contentContainerStyle={styles.categoryGrid}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No categories loaded.</Text>
            )}
          />
        )}
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  searchBar: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activeTab: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  inactiveTab: {
    fontSize: 16,
    color: '#888',
  },
  categoryGrid: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%', // Adjust for spacing
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA', // Placeholder color
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});

export default DictionaryCategories;
