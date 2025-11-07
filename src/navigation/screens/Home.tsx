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
import { fetchCategories, fetchAllModules } from '../../api/fetch';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PROGRESS_STORAGE_KEY = 'userProgress';

// Define types for clarity (assuming these interfaces are available in a global type file or fetched types)
// interface CategoryItem { id: string; title: string; icon: string; bgColor: string; moduleCount: number; }
// interface LearningModule { id: string; lessons: any[]; category: string; ... }

const Home = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]); // Used for category display list
  const [allModules, setAllModules] = useState([]); // Used for 'Continue' logic and filtering
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Helper function to create a unique key
  const getUniqueModuleKey = (mod) => `${mod.category}-${mod.id}`;

  // Function to load progress from AsyncStorage (no change needed here)
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

  // Use useFocusEffect to reload categories, modules, and progress whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch categories list (for UI display)
          const fetchedCategories = await fetchCategories();
          setCategories(fetchedCategories);

          // 2. Fetch ALL modules (for 'Continue' logic and filtering on category press)
          const modules = await fetchAllModules();
          setAllModules(modules);

          // 3. Load user progress
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

  const handleContinue = () => {
    // Logic uses the flattened 'allModules' list
    const uncompletedModule = allModules.find(mod => {
      const uniqueKey = getUniqueModuleKey(mod); // <-- Use composite key
      const progress = userProgress[uniqueKey];
      return !progress || progress.lessonsCompleted < mod.lessons.length;
    });

    if (uncompletedModule) {
      const uniqueKey = getUniqueModuleKey(uncompletedModule); // <-- Use composite key
      const completedLessonsCount = userProgress[uniqueKey]?.lessonsCompleted || 0;
      const nextLessonIndex = completedLessonsCount;

      navigation.navigate('LessonScreen', {
        lessons: uncompletedModule.lessons,
        initialLessonIndex: nextLessonIndex,
        moduleId: uniqueKey // <-- Pass the unique composite key
      });
      return;
    }

    Alert.alert("No New Modules", "It looks like you've finished all available modules. Great work! Select a category below to retake modules.");
  };

  const handleCategoryPress = (categoryId, categoryTitle) => {
    if (isLoading) return;

    // Filter the global 'allModules' list for the selected category
    const modulesInCategory = allModules.filter(mod => mod.category === categoryId);

    if (modulesInCategory.length === 0) {
      Alert.alert('No Modules', `No learning modules found for the '${categoryTitle}' category yet.`);
      return;
    }

    // Navigate to the new screen, passing the filtered modules and current user progress
    navigation.navigate('CategoryModulesScreen', {
      categoryTitle: categoryTitle,
      // Pass the filtered modules and user progress for the child screen to render
      learningModules: modulesInCategory, 
      userProgress: userProgress,
    });
  };

  // Helper function to get completion status
  const getCategoryCompletionStatus = (categoryId) => {
    // Filter modules belonging to this category from the global list
    const categoryModules = allModules.filter(mod => mod.category === categoryId);
    
    if (categoryModules.length === 0) return { total: 0, completed: 0, percentage: 0 };

    let completedCount = 0;
    let totalCount = categoryModules.length;

    categoryModules.forEach(mod => {
      const uniqueKey = getUniqueModuleKey(mod); // <-- Use composite key
      const progress = userProgress[uniqueKey];
      if (progress && progress.lessonsCompleted >= mod.lessons.length) {
        completedCount++;
      }
    });

    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { total: totalCount, completed: completedCount, percentage: percentage };
  };

  // Render a category card (styled to resemble the screenshot)
  const renderCategoryCard = (category) => {
    const { total, completed, percentage } = getCategoryCompletionStatus(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category.id, category.title)}
      >
        <View style={styles.categoryIconContainer}>
          <AnimatedCircularProgress
            size={80} // Size of the circle (was 80 for the View)
            width={5} // Thickness of the progress line (was 5 for borderWidth)
            fill={percentage} // Current percentage fill (0-100)
            tintColor={"#FF9500"} // Color of the progress arc (using category color or a default)
            backgroundColor="#E0E0E0" // Color of the background track
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
            disabled={isLoading || allModules.length === 0}
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