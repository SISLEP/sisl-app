import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Import the specific fetch function
import { fetchModulesByCategory } from '../../api/fetch'; 
// 🚨 Import the custom hook
import { useProgress } from '../../context/ProgressContext';

// Assuming the module structure looks something like this:
// type Lesson = { id: string; title: string; ... };
// type LearningModule = { id: string; title: string; subtitle: string; icon: string; bgColor: string; lessons: Lesson[]; category: string };
// type UserProgress = { [moduleId: string]: { lessonsCompleted: number } };

const CategoryModulesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryTitle } = route.params; 
  
  // Get progress and update function from Context
  const { userProgress, updateModuleProgress } = useProgress();

  const [learningModules, setLearningModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: Fetch logic uses useFocusEffect ---
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadModules = async () => {
        setIsLoading(true);
        if (!categoryId) {
            console.error("Missing categoryId for fetching modules.");
            setIsLoading(false);
            return;
        }

        try {
          const modules = await fetchModulesByCategory(categoryId);
          if (isActive) {
            setLearningModules(modules);
          }
          if (modules.length === 0) {
            Alert.alert('No Modules', `No learning modules found for the '${categoryTitle}' category yet.`);
          }
        } catch (error) {
          console.error(`Failed to load modules for category ${categoryId}:`, error);
          Alert.alert('Error', 'Failed to load modules. Please check your network connection.');
          if (isActive) {
            setLearningModules([]);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      loadModules();

      return () => {
        isActive = false; // Cleanup function to prevent setting state on unmounted component
      };
    // 🚨 CHANGE: Add userProgress as a dependency. This ensures the component logic 
    // for progress display is re-evaluated whenever the screen is focused AND 
    // the global progress state has changed.
    }, [categoryId, categoryTitle, userProgress]) 
  );
  // --- END NEW Fetch logic ---


  // Helper function to create a unique composite key: category-id (e.g., "alphabet-1")
  const getUniqueModuleKey = (module) => `${module.category}-${module.id}`;

  // Helper function to get the progress text
  const getProgressText = (module) => { // Takes the full module object now
    const uniqueKey = getUniqueModuleKey(module); // <-- Build composite key
    const progress = userProgress[uniqueKey];    // <-- Uses context's userProgress

    if (progress) {
      const isCompleted = progress.lessonsCompleted >= module.lessons.length;
      return isCompleted ? 'Completed!' : `${progress.lessonsCompleted}/${module.lessons.length} Lessons Complete`;
    }
    return '0 Lessons Complete';
  };

  // Helper function for module press logic
  const handleModulePress = (selectedModule) => { // Takes the full module object now
    if (!selectedModule || selectedModule.lessons.length === 0) {
      Alert.alert('No lessons', 'This module has no lessons yet.');
      return;
    }

    const uniqueKey = getUniqueModuleKey(selectedModule); // <-- Build composite key
    const progress = userProgress[uniqueKey];             // <-- Uses context's userProgress
    
    // Check if progress exists and if all lessons are completed.
    const isCompleted = progress && progress.lessonsCompleted >= selectedModule.lessons.length;

    if (isCompleted) {
      Alert.alert(
        'Module Completed',
        'You have already finished this module. Do you want to retake the lessons from the beginning?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Retake',
            onPress: () => {
              navigation.navigate('LessonScreen', {
                lessons: selectedModule.lessons,
                initialLessonIndex: 0, // Start from the beginning
                moduleId: uniqueKey,   // <-- Pass the unique composite key
              });
            },
          },
        ],
      );
    } else {
      // Continue from the last completed lesson or start from the beginning
      const initialLessonIndex = progress?.lessonsCompleted || 0;
      navigation.navigate('LessonScreen', {
        lessons: selectedModule.lessons,
        initialLessonIndex: initialLessonIndex,
        moduleId: uniqueKey, // <-- Pass the unique composite key
      });
    }
  };

  // Helper function to render a module card
  const renderLearningModule = (module) => (
    <TouchableOpacity
      key={getUniqueModuleKey(module)} // Use unique key for React's list rendering
      style={[styles.moduleCard, { backgroundColor: module.bgColor || '#EBEBEB' }]} // Added fallback bgColor
      onPress={() => handleModulePress(module)} // Pass the full module object
    >
      <View style={styles.moduleIcon}>
        <Text style={styles.moduleEmoji}>{module.icon}</Text>
      </View>
      <View style={styles.moduleContent}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
        <Text style={styles.progressText}>{getProgressText(module)}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF9500" style={styles.loadingIndicator} />
        ) : (
          learningModules.length > 0 ? (
            <View style={styles.modulesSection}>
              {learningModules.map(renderLearningModule)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No modules found for this category.</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
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
    paddingTop: 10,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  loadingIndicator: { // Added style for the loading indicator
    marginVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300, // Give it some height for visibility
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  modulesSection: {
    gap: 16,
    paddingBottom: 40, // Add padding to bottom for scroll
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleEmoji: {
    fontSize: 20,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  moduleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressText: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default CategoryModulesScreen;