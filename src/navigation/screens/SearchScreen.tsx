// screens/SearchScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DictionaryData } from '../../api/fetch';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define the structure for the route parameters passed from DictionaryCategories
type SearchScreenRouteProp = {
  params: {
    categories: string[];
    dictionaryData: DictionaryData;
  };
};

// Define a type for a sign item (word/phrase)
type SignItem = {
  sign: string;
  category: string;
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SearchScreenRouteProp>();
  const { categories, dictionaryData } = route.params;

  const [searchText, setSearchText] = useState('');

  // 1. Flatten all words into a single list of signs for easier searching
  const allSigns: SignItem[] = useMemo(() => {
    return Object.entries(dictionaryData).flatMap(([category, words]) =>
      words.map(wordData => ({
        sign: wordData.word || '', // Assuming 'word' is the key for the sign/phrase
        category: category,
      }))
    );
  }, [dictionaryData]);

  // 2. Filter logic for Collections (Categories)
  const matchingCollections = useMemo(() => {
    if (!searchText) return [];
    const lowerCaseSearch = searchText.toLowerCase();
    // Filter categories that include the search text
    return categories.filter(category =>
      category.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchText, categories]);

  // 3. Filter logic for Signs (Words/Phrases)
  const matchingSigns = useMemo(() => {
    if (!searchText) return [];
    const lowerCaseSearch = searchText.toLowerCase();
    // Filter signs that include the search text
    return allSigns.filter(item =>
      item.sign.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchText, allSigns]);

  // Handles navigation for a selected Sign
  const handleSignPress = (signItem: SignItem) => {
    // 1. Get the full list of words for the category
    const categoryWords = dictionaryData[signItem.category] || [];

    if (categoryWords.length === 0) {
        Alert.alert('Error', `Could not load words for category: ${signItem.category}`);
        return;
    }

    // 2. Find the index of the selected sign within its category list
    // We assume the 'word' property in WordData matches the 'sign' property in SignItem.
    const initialIndex = categoryWords.findIndex(
        wordData => wordData.word === signItem.sign
    );

    if (initialIndex === -1) {
        Alert.alert('Error', `Sign "${signItem.sign}" not found in its category list.`);
        return;
    }

    // 3. Navigate to SignDetailsScreen
    // Ensure 'SignDetailsScreen' is defined in your navigation stack
    navigation.navigate('SignDetails' as never, { 
        category: signItem.category, // Pass the category name
        words: categoryWords,        // Pass the full list of words in that category
        initialIndex: initialIndex,  // Pass the index of the selected word
    } as never);
  };

  // Component to render a single matching collection (category)
  const CollectionCard = ({ collectionName }: { collectionName: string }) => (
    <TouchableOpacity style={styles.collectionCard} onPress={() => {
        // Find the full word list for the collection and navigate to it
        const categoryWords = dictionaryData[collectionName] || [];
        navigation.navigate('DictionaryWords' as never, {
            category: collectionName,
            words: categoryWords,
        } as never);
    }}>
      {/* Placeholder for the icon seen in the screenshot */}
      <View style={styles.collectionIconPlaceholder}>
          <Text style={styles.iconText}>A-Z</Text> 
      </View>
      <Text style={styles.collectionName}>{collectionName}</Text>
    </TouchableOpacity>
  );

  // Component to render a single matching sign (word/phrase)
  const SignItemComponent = ({ signItem }: { signItem: SignItem }) => (
    <TouchableOpacity
      style={styles.signItem}
      onPress={() => handleSignPress(signItem)}
    >
      {/* Placeholder for the arrow icon seen in the screenshot */}
      <Text style={styles.arrowIcon}>↗</Text> 
      <Text style={styles.signText}>{signItem.sign}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header/Search Bar Area */}
        <View style={styles.header}>
          {/* Static Search Icon instead of Back Button */}
          <View style={styles.backButton}>
            <Icon name="search" size={24} color="#000" />
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#888888"
            onChangeText={setSearchText}
            value={searchText}
            autoFocus={true} // Focus on open for immediate typing
          />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {searchText.length > 0 ? (
            <>
              {/* Matching Collections Section */}
              {matchingCollections.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Matching collections</Text>
                  {matchingCollections.map((name) => (
                    <CollectionCard key={name} collectionName={name} />
                  ))}
                </>
              )}
              {/* No Collections Found */}
              {matchingCollections.length === 0 && (
                 <Text style={styles.noResultsText}>No matching collections found.</Text>
              )}

              {/* Matching Signs Section */}
              {matchingSigns.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Matching signs</Text>
                  {matchingSigns.map((item, index) => (
                    <SignItemComponent key={index} signItem={item} />
                  ))}
                </>
              )}
              {/* No Signs Found */}
              {matchingSigns.length === 0 && (
                 <Text style={styles.noResultsText}>No matching signs found.</Text>
              )}

              {/* Display "No results" if neither signs nor collections matched */}
              {matchingSigns.length === 0 && matchingCollections.length === 0 && (
                 <Text style={styles.noResultsText}>No results found for "{searchText}".</Text>
              )}

            </>
          ) : (
            // Initial state (optional: could show recent searches or suggestions)
            <Text style={styles.initialText}>Start typing to search for signs and collections.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },

  searchBar: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 8,
    fontSize: 17,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  // Collection (Category) Styles
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  collectionIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#C5E1A5', // Light green placeholder color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontWeight: 'bold',
    color: '#558B2F', // Darker green text
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Sign Item Styles
  signItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#FF9500', // Example accent color
    marginRight: 10,
    transform: [{ rotate: '45deg' }], // Rotate the arrow for the desired look
  },
  signText: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  initialText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#888',
      paddingHorizontal: 20,
  }
});

export default SearchScreen;