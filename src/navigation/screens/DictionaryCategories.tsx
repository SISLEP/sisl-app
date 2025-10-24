// screens/DictionaryCategories.tsx

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator, 
  Alert, 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchDictionaryData, DictionaryData } from '../../api/fetch'; 

const DictionaryCategories = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<string[]>([]);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData>({});
  const [isLoading, setIsLoading] = useState(true);

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
      setCategories([]);
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

  // Component for a single category card
  const CategoryCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={styles.categoryTitle}>{item}</Text>
    </TouchableOpacity>
  );

  // Function to render categories in a two-column grid using map()
  const renderCategoryGrid = () => {
    // We will create pairs of items to render in rows
    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      rows.push(categories.slice(i, i + 2));
    }

    return (
      <View style={styles.gridContainer}>
        {rows.map((row, index) => (
          <View key={index} style={styles.gridRow}>
            <CategoryCard item={row[0]} />
            {/* If there is a second item in the row, render it, otherwise render an empty view for spacing */}
            {row.length > 1 ? (
              <CategoryCard item={row[1]} />
            ) : (
              <View style={styles.emptyCardSpace} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    // Use View as the outermost container
    <View style={styles.container}>
      {isLoading ? (
        // Render loading indicator centered on the screen when loading
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9500" />
        </View>
      ) : (
        // Use ScrollView to wrap all content, including the header elements
        <ScrollView contentContainerStyle={styles.contentContainer}>
            
          {/* Header Content */}
          <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Explore</Text>
              <TextInput style={styles.searchBar} placeholder="Search for signs or collections" />
              <View style={styles.tabContainer}>
                <Text style={styles.activeTab}>Public</Text>
                <Text style={styles.inactiveTab}>My collections</Text>
              </View>
          </View>
          
          {/* Category Grid */}
          {categories.length > 0 ? (
            renderCategoryGrid()
          ) : (
            <Text style={styles.emptyText}>No categories loaded.</Text>
          )}

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Main content container for the ScrollView
  contentContainer: {
    paddingBottom: 20, 
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20, 
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
  // Styles for the manually constructed grid
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // Spacing between rows
  },
  categoryCard: {
    width: '48%', 
    height: 120,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCardSpace: {
    width: '48%', // Matches the card width to maintain layout
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingOverlay: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { 
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    paddingHorizontal: 20,
  }
});

export default DictionaryCategories;
