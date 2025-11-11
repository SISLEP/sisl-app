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
import { 
    fetchCategories, 
    isCategoryFullyDownloaded, // 🚨 NEW: Import new status check
    downloadCategoryVideos,    // 🚨 NEW: Import download function
    removeCategoryVideos,      // 🚨 NEW: Import remove function
} from '../../api/fetch'; 
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PROGRESS_STORAGE_KEY = 'userProgress';

// 🚨 NEW: Define types for download status
type DownloadStatus = 'NOT_DOWNLOADED' | 'DOWNLOADING' | 'DOWNLOADED';

const Home = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  // 🚨 NEW: State for tracking download status per category
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: DownloadStatus }>({});

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

  // 🚨 NEW: Helper function to check and update all download statuses
  const checkAllDownloadStatuses = async (categoriesList) => {
    const statusChecks = categoriesList.map(async (category) => {
        // id is the lowercase category ID (e.g., 'alphabet')
        const isDownloaded = await isCategoryFullyDownloaded(category.id); 
        return {
            categoryId: category.id,
            status: isDownloaded ? 'DOWNLOADED' : 'NOT_DOWNLOADED',
        };
    });

    const results = await Promise.all(statusChecks);
    const newStatus = results.reduce((acc, curr) => {
        acc[curr.categoryId] = curr.status;
        return acc;
    }, {});
    
    setDownloadStatus(newStatus);
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
          
          // 3. Load download status for all categories 🚨 NEW
          await checkAllDownloadStatuses(fetchedCategories); 
          
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
  
  // 🚨 NEW: Download Handler
  const handleDownloadCategory = async (categoryId: string, categoryTitle: string) => {
    Alert.alert(
        'Confirm Download',
        `Do you want to download all videos for '${categoryTitle}'? This may take some time depending on your internet connection.`,
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Download',
                onPress: async () => {
                    setDownloadStatus(prev => ({ ...prev, [categoryId]: 'DOWNLOADING' }));
                    try {
                        await downloadCategoryVideos(categoryId);
                        Alert.alert('Success', `All videos for ${categoryTitle} are now available offline!`);
                        setDownloadStatus(prev => ({ ...prev, [categoryId]: 'DOWNLOADED' }));
                    } catch (error) {
                        Alert.alert('Download Failed', `Could not download videos for ${categoryTitle}. Please try again.`);
                        console.error('Download Error:', error);
                        setDownloadStatus(prev => ({ ...prev, [categoryId]: 'NOT_DOWNLOADED' }));
                    }
                },
            },
        ],
        { cancelable: true }
    );
  };
  
  // 🚨 NEW: Remove Download Handler
  const handleRemoveDownload = async (categoryId: string, categoryTitle: string) => {
    Alert.alert(
        'Confirm Removal',
        `Do you want to remove all downloaded videos for '${categoryTitle}'? This will free up storage space.`,
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    setDownloadStatus(prev => ({ ...prev, [categoryId]: 'NOT_DOWNLOADED' }));
                    try {
                        await removeCategoryVideos(categoryId);
                        Alert.alert('Success', `Offline videos for ${categoryTitle} have been removed.`);
                    } catch (error) {
                        Alert.alert('Removal Failed', `Could not remove videos for ${categoryTitle}.`);
                        console.error('Removal Error:', error);
                        // Revert status on failure
                        setDownloadStatus(prev => ({ ...prev, [categoryId]: 'DOWNLOADED' })); 
                    }
                },
            },
        ],
        { cancelable: true }
    );
  };


  // Finds next incomplete Category
  const handleContinue = () => {
    if (isLoading || categories.length === 0) return;
    // ... rest of handleContinue is unchanged ...
    const isCategoryComplete = (category) => {
      const totalModules = category.moduleCount || 0;
      if (totalModules === 0) return true; 
      const modulesWithProgress = Object.keys(userProgress).filter(key => 
        key.startsWith(category.id + '-')
      ).length;
      return modulesWithProgress >= totalModules;
    };

    const nextCategory = categories.find(category => !isCategoryComplete(category));

    if (nextCategory) {
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
    const totalCount = category.moduleCount || 0; 
    
    const completedCount = Object.keys(userProgress).filter(key => 
      key.startsWith(category.id + '-')
    ).length;

    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return { 
        total: totalCount, 
        completed: completedCount, 
        percentage: percentage
    };
  };

  // Render a category card
  const renderCategoryCard = (category) => {
    const { total, completed, percentage } = getCategoryCompletionStatus(category);
    // 🚨 NEW: Get current download status
    const status = downloadStatus[category.id] || 'NOT_DOWNLOADED';
    const isDownloading = status === 'DOWNLOADING';
    const isDownloaded = status === 'DOWNLOADED';
    const canDownload = status === 'NOT_DOWNLOADED';
    
    // Choose appropriate icon and color based on status
    let downloadIcon = canDownload ? 'cloud-download' : (isDownloaded ? 'cloud-done' : 'downloading');
    let iconColor = isDownloaded ? '#FFFFFF' : (isDownloading ? '#FFF' : '#FF9500'); 
    
    // Determine the button's action and disability state
    const actionHandler = isDownloaded 
        ? () => handleRemoveDownload(category.id, category.title)
        : canDownload
        ? () => handleDownloadCategory(category.id, category.title)
        : null; // Null/disabled when downloading

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
        
        {/* 🚨 NEW: Download Button/Status Indicator */}
        <TouchableOpacity
            style={[
                styles.downloadButton, 
                isDownloading && styles.downloadingButton,
                isDownloaded && styles.removeButton, // Style for removal option
                (isDownloading || isLoading) && styles.disabledButton,
            ]}
            onPress={actionHandler}
            disabled={isDownloading || isLoading}
        >
            <Icon 
                name={downloadIcon} 
                size={20} 
                color={iconColor} 
            />
            {/* <Text style={[
                styles.downloadButtonText, 
                (isDownloading || isDownloaded) && { color: '#FFF' },
            ]}>
                {isDownloading ? 'Downloading...' : (isDownloaded ? 'Remove Offline' : 'Download All')}
            </Text> */}
        </TouchableOpacity>
        
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
    width: '45%',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 5, // 🚨 NEW: Adjusted padding
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
    marginBottom: 5,
  },
  // 🚨 NEW: Download button styles
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0', // Light grey for download
    width: '100%',
  },
  downloadingButton: {
    backgroundColor: '#FF9500', // Orange for downloading state
  },
  removeButton: {
    backgroundColor: '#4CD964', // Green for remove/downloaded state
  },
  downloadButtonText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500', // Orange color for default state
  },
  // Re-use disabledButton for all disabled states
  disabledButton: {
    opacity: 0.6,
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