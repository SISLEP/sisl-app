import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCategories } from '../../api/fetch'; 
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PROGRESS_STORAGE_KEY = 'userProgress';

const Home = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Helper function to load progress from AsyncStorage
  const loadProgress = async () => {
    try {
      const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (storedProgress) {
        setUserProgress(JSON.parse(storedProgress));
      }
    } catch (e) {
      console.error('Failed to load progress from storage', e);
    }
  };

  // Use useFocusEffect to reload categories and progress
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch categories list
          const fetchedCategories = await fetchCategories();
          setCategories(fetchedCategories);

          // 2. Load user progress
          await loadProgress();
        } catch (error) {
          Alert.alert('Error', 'Failed to load data. Please check your network connection.');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
  );

  // Finds next incomplete Category
  const handleContinue = () => {
    if (isLoading || categories.length === 0) return;

    // Helper to check if a category is fully completed based on moduleCount and userProgress keys
    const isCategoryComplete = (category) => {
      const totalModules = category.moduleCount || 0;
      if (totalModules === 0) return true; // Treat empty categories as complete

      // Count how many modules in this category have *any* progress recorded.
      const modulesWithProgress = Object.keys(userProgress).filter(key => 
        key.startsWith(category.id + '-')
      ).length;

      // This is still an assumption: a module is only counted as complete if it has
      // a progress entry. We assume that if every module has an entry, the category is "done" 
      // for the purpose of finding the next one.
      return modulesWithProgress >= totalModules;
    };

    // Find the first category that is NOT complete
    const nextCategory = categories.find(category => !isCategoryComplete(category));

    if (nextCategory) {
      // Navigate to the found category. CategoryModulesScreen will load the modules 
      // and determine the exact next lesson index based on userProgress.
      navigation.navigate('CategoryModulesScreen', {
        categoryId: nextCategory.id, 
        categoryTitle: nextCategory.title,
        userProgress: userProgress,
      });
    } else {
      Alert.alert("All Modules Complete!", "You've finished all available lessons. Great work! Select a category to retake modules.");
    }
  };

  const handleCategoryPress = (categoryId, categoryTitle) => {
    if (isLoading) return;

    navigation.navigate('CategoryModulesScreen', {
      categoryId: categoryId, 
      categoryTitle: categoryTitle,
      userProgress: userProgress,
    });
  };

  const getCategoryCompletionStatus = (category) => {
    const totalCount = category.moduleCount || 0; // Use moduleCount from fetched data
    
    // Count how many modules in this category have progress recorded.
    const completedCount = Object.keys(userProgress).filter(key => 
      key.startsWith(category.id + '-')
    ).length;

    // Calculate percentage based on modules completed vs. total modules in category
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return { 
        total: totalCount, 
        completed: completedCount, 
        percentage: percentage
    };
  };
  // --- END REVISED getCategoryCompletionStatus ---

  // Render a category card
  const renderCategoryCard = (category) => {
    const { total, completed, percentage } = getCategoryCompletionStatus(category);

    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category.id, category.title)}
      >
        <View style={styles.categoryIconContainer}>
          <AnimatedCircularProgress
            size={80}
            width={5}
            fill={percentage} 
            tintColor={"#FF9500"} 
            backgroundColor="#E0E0E0" 
          >
            {
              () => (
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              )
            }
          </AnimatedCircularProgress>
        </View>
        <Text style={styles.categoryTitleText}>{category.title}</Text>
        <Text style={styles.categoryCompletionText}>{`${completed}/${total} Modules`}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>Welcome!</Text>
              <Text style={styles.welcomeSubtitle}>Continue lesson</Text>
              <Text style={styles.welcomeDescription}>Let's learn new signs!</Text>
            </View>
            <View style={styles.mascotContainer}>
              <Text style={styles.mascot}>🤖</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.disabledButton]} 
            onPress={handleContinue} 
            disabled={isLoading || categories.length === 0}
          >
            <Text style={styles.continueButtonText}>
                {isLoading ? 'Loading...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF9500" style={styles.loadingIndicator} />
          ) : (
            <View style={styles.categoryList}>
              {categories.map(renderCategoryCard)}
            </View>
          )}
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator}>
          <View style={styles.indicatorLine} />
        </View>
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
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
  },
  mascotContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    fontSize: 32,
  },
  continueButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryCard: {
    width: '45%', // Approximately half-width with some spacing
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryIconContainer: {
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  categoryTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCompletionText: {
    fontSize: 12,
    color: '#666',
  },
  bottomIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicatorLine: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
});

export default Home;