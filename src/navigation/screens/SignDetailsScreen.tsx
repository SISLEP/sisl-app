// screens/SignDetailsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 🚨 NEW: Import the necessary functions from the API service
import { 
  isCategoryFullyDownloaded, 
  getBestVideoSource 
} from '../../api/fetch'; 

const { width } = Dimensions.get('window');

const SignDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, initialIndex, words: allWords } = route.params;

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [mediaType, setMediaType] = useState('video');
  
  // 🚨 NEW STATES: To hold the actual URI/URL after checking for local files
  const [currentVideoUri, setCurrentVideoUri] = useState(null);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [isFullyDownloaded, setIsFullyDownloaded] = useState(false); // Cache category status
  const [isLoadingMedia, setIsLoadingMedia] = useState(true); // Track media source loading

  // --- Initial Data Load and Status Check ---
  useEffect(() => {
    setWords(allWords);
    
    // Check and cache the category's download status once
    const checkDownloadStatus = async () => {
        // Use lowercase title as category ID, matching the logic in fetch.tsx
        const categoryId = category.toLowerCase();
        const isDl = await isCategoryFullyDownloaded(categoryId);
        console.log("myy category download status", categoryId, isDl);
        setIsFullyDownloaded(isDl);
    };
    
    checkDownloadStatus();
  }, [allWords, category]);

  // --- Media Source Resolution Effect (triggered by index change) ---
  useEffect(() => {
    // Return early if no words.
    if (words.length === 0) return; 
    
    // Reset media type and start loading indicator
    setMediaType('video');
    setIsLoadingMedia(true);

    const currentSign = words[currentIndex];
    const categoryId = category.toLowerCase(); // Use lowercase title as category ID

    const resolveSources = async () => {
        // Resolve Video Source
        const bestVideoSource = await getBestVideoSource(
            currentSign.signVideo, 
            categoryId, 
            isFullyDownloaded
        );
        setCurrentVideoUri(bestVideoSource);
        console.log("myy ", bestVideoSource)

        // Resolve Image Source (if available)
        if (currentSign.signImage) {
            const bestImageSource = await getBestVideoSource(
                currentSign.signImage, 
                categoryId, 
                isFullyDownloaded
            );
            setCurrentImageUri(bestImageSource);
        } else {
            setCurrentImageUri(null); // Clear image URI if not available for this word
        }
        
        setIsLoadingMedia(false);
    };

    resolveSources();
  }, [currentIndex, words, category, isFullyDownloaded]); // Depend on currentIndex and cached status

  const handleNext = () => {
    // Reset URI/URL to null to force loading state briefly on next sign
    setCurrentVideoUri(null);
    setCurrentImageUri(null);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
  };

  const handlePrevious = () => {
    // Reset URI/URL to null
    setCurrentVideoUri(null);
    setCurrentImageUri(null);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
  };

  // FUNCTION: Toggles between 'video' and 'image'
  const toggleMedia = () => {
    setMediaType((prevType) => (prevType === 'video' ? 'image' : 'video'));
  };

  if (words.length === 0 || isLoadingMedia || !currentVideoUri) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{words.length === 0 ? 'No signs available.' : 'Loading sign media...'}</Text>
      </View>
    );
  }

  const currentSign = words[currentIndex];
  
  const isImageAvailable = !!currentImageUri; // Use the resolved URI state
  const isVideoVisible = mediaType === 'video';
  const videoPausedState = !isVideoVisible;
  const videoKey = `sign-video-${currentIndex}`;


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Sign Media Container */}
        <View style={styles.signMediaContainer}>

          {/* Video Component */}
          {/* 🚨 UPDATED: Use currentVideoUri for source */}
          <Video
            key={videoKey} 
            source={{ uri: currentVideoUri }} 
            style={[styles.mediaElement, !isVideoVisible && styles.hiddenMedia]}
            paused={videoPausedState}
            repeat={true}
            resizeMode="contain"
            muted={true}
          />

          {/* Image Component */}
          {isImageAvailable && (
            // 🚨 UPDATED: Use currentImageUri for source
            <Image
              source={{ uri: currentImageUri }}
              style={[styles.mediaElement, isVideoVisible && styles.hiddenMedia]}
              resizeMode="contain"
            />
          )}

          {/* Overlay for Word and Toggle Icon */}
          <View style={styles.signOverlay}>
            <Text style={styles.signOverlayText}>{currentSign.word}</Text>
          </View>

          {/* TOGGLE BUTTON LOGIC: Only show if an image is available */}
          {isImageAvailable && (
            <TouchableOpacity style={styles.toggleButton} onPress={toggleMedia}>
              <Icon 
                name="cached" // Reverse/cached icon
                size={30} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}

        </View>

        {/* Navigation Section */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevious}>
            <Icon name="arrow-back-ios" size={30} color="#FF9500" />
          </TouchableOpacity>
          <View style={styles.currentSignContainer}>
            <Text 
              style={styles.currentSignWord}
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {currentSign.word}
            </Text>
          </View>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
            <Icon name="arrow-forward-ios" size={30} color="#FF9500" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  signMediaContainer: {
    width: width * 0.9,
    height: width * 0.9,
    maxWidth: 400,
    maxHeight: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  hiddenMedia: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  signOverlay: {
    position: 'absolute',
    bottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    zIndex: 10,
  },
  signOverlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    zIndex: 10,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  arrowButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#FFF5E6',
  },
  currentSignContainer: {
    // Takes up only the remaining space
    flex: 1, 
    alignItems: 'center',
  },
  currentSignWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center', 
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  menuItem: {
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignDetailsScreen;