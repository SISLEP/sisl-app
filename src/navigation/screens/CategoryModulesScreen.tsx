import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Assuming the module structure looks something like this:
// type Lesson = { id: string; title: string; ... };
// type LearningModule = { id: string; title: string; subtitle: string; icon: string; bgColor: string; lessons: Lesson[]; category: string };
// type UserProgress = { [moduleId: string]: { lessonsCompleted: number } };

const CategoryModulesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Destructure params passed from Home.tsx
  // We don't use moduleIdList, so it is removed for cleanliness.
  const { categoryTitle, learningModules, userProgress } = route.params;

  if (!learningModules || learningModules.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No modules found for this category.</Text>
      </View>
    );
  }

  // Helper function to create a unique composite key: category-id (e.g., "alphabet-1")
  const getUniqueModuleKey = (module) => `${module.category}-${module.id}`;

  // Helper function to get the progress text
  const getProgressText = (module) => { // Takes the full module object now
    const uniqueKey = getUniqueModuleKey(module); // <-- Build composite key
    const progress = userProgress[uniqueKey];    // <-- Use composite key for lookup

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
    const progress = userProgress[uniqueKey];             // <-- Use composite key for lookup
    
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        <View style={styles.modulesSection}>
          {learningModules.map(renderLearningModule)}
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
    paddingTop: 10,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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