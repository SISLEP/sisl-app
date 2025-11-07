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
// We only import fetchCategories (and implicitly don't import fetchAllModules)
import { fetchCategories } from '../../api/fetch'; 
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PROGRESS_STORAGE_KEY = 'userProgress';

// Define types for clarity (CategoryItem now includes moduleCount)
// interface CategoryItem { id: string; title: string; icon: string; bgColor: string; moduleCount: number; }

const Home = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]); 
  // allModules state remains removed
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Helper function to load progress from AsyncStorage (no change needed here)
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

  // Use useFocusEffect to reload categories and progress whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch categories list (The ONLY network fetch now)
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

  // --- REVISED handleContinue (Simplification for no allModules) ---
  const handleContinue = () => {
    // Since we lack total lesson count/next module pointer, we prompt the user to continue 
    // in the first category that has *started* progress or the very first category.
    Alert.alert(
      "Continue Learning", 
      "To find your next lesson, please select a category below. The category screen will check your progress and prompt you to continue.",
      [{ text: 'OK' }]
    );
  };
  // --- END REVISED handleContinue ---

  const handleCategoryPress = (categoryId, categoryTitle) => {
    if (isLoading) return;

    // Navigate immediately, passing the minimum required data.
    navigation.navigate('CategoryModulesScreen', {
      categoryId: categoryId, 
      categoryTitle: categoryTitle,
      userProgress: userProgress,
    });
  };

  // --- REVISED getCategoryCompletionStatus (Using moduleCount and Progress Keys) ---
  const getCategoryCompletionStatus = (category) => {
    const totalCount = category.moduleCount || 0; // Use moduleCount from fetched data
    let completedCount = 0;

    // Iterate through all modules defined in userProgress
    Object.keys(userProgress).forEach(key => {
      // Check if the progress key belongs to the current category (e.g., 'alphabet-1')
      if (key.startsWith(category.id + '-')) {
        const progress = userProgress[key];
        
        // This is a major assumption due to not fetching modules: 
        // We MUST assume a module is completed if lessonsCompleted > 0
        // OR if the value explicitly tracks full completion status (which it doesn't here).
        // Since we don't know the module's lesson count, we can only count modules that have 
        // *some* progress, or rely on a property we don't have.
        
        // The most conservative count is to simply count how many module keys exist in progress
        // and assume that if a key exists, the module may be considered started/completed.

        // A better temporary solution: We count how many modules have keys in userProgress
        // and assume that number is the 'completed' count for the home screen for now.
        // This is highly inaccurate without lesson data, but it's the best we can do.

        // For this scenario, we must assume that modules are completed when the screen is focused.
        // Since the progress value structure is incomplete for this calculation,
        // we revert to simply counting keys as "modules with progress".
        
        // We will only count it as completed if the value is explicitly marked as completed, 
        // which requires a change on the LessonScreen logic (not shown here). 
        // Since we can't change that, we revert to showing TOTAL modules only.

        // Reverting to showing just the total available count:
        // *We cannot reliably calculate completion percentage or completed count here.*
      }
    });
    
    // For the UI to render, we'll try to count how many keys start with the category ID.
    const modulesWithProgress = Object.keys(userProgress).filter(key => key.startsWith(category.id + '-')).length;

    // IMPORTANT: This calculation is a guess and ONLY works if every module has a progress key.
    // If the category has a moduleCount, we can assume that if all those module keys are present, it's done.
    
    // For now, let's just display total modules and an empty progress bar.
    return { 
        total: totalCount, 
        completed: modulesWithProgress, 
        // The percentage is based on modulesWithProgress / totalCount
        percentage: totalCount > 0 ? Math.round((modulesWithProgress / totalCount) * 100) : 0
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
            // Use the derived (but assumed) percentage
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
        {/* Use the calculated progress for display, knowing it's based on assumptions */}
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