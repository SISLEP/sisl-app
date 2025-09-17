// screens/DictionaryCategories.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dictionaryData from '../../assets/data/dictionary.json'; // Import your JSON data

const DictionaryCategories = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Extract unique categories from the JSON data
    const uniqueCategories = [
      ...new Set(dictionaryData.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);
  }, []);

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('DictionaryWords', { category: item })}
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
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.categoryGrid}
        />
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
});

export default DictionaryCategories;