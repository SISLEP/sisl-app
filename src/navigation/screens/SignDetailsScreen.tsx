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

const { width } = Dimensions.get('window');

const SignDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, initialIndex, words: allWords } = route.params;

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  // NEW STATE: Tracks which media is currently visible. 'video' by default.
  const [mediaType, setMediaType] = useState('video'); 

  useEffect(() => {
    // Use the words passed from the previous screen
    setWords(allWords);
  }, [allWords]);

  // Reset mediaType to 'video' whenever the current word index changes.
  useEffect(() => {
    setMediaType('video');
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
  };

  // FUNCTION: Toggles between 'video' and 'image'
  const toggleMedia = () => {
    setMediaType((prevType) => (prevType === 'video' ? 'image' : 'video'));
  };

  if (words.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No signs available for this category.</Text>
      </View>
    );
  }

  const currentSign = words[currentIndex];
  const signImageUrl = currentSign.signImage;
  
  const isImageAvailable = !!signImageUrl;
  const isVideoVisible = mediaType === 'video';
  
  // Pause video when the image is visible
  const videoPausedState = !isVideoVisible;

  // Create a unique key for the Video component based on the current index
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
          <Video
            key={videoKey} // <-- This forces the video component to reload completely
            source={{ uri: currentSign.signVideo }}
            // Apply hiddenMedia if it's the image's turn
            style={[styles.mediaElement, !isVideoVisible && styles.hiddenMedia]}
            paused={videoPausedState}
            repeat={true}
            resizeMode="contain"
            muted={true}
          />

          {/* Image Component */}
          {isImageAvailable && (
            <Image
              source={{ uri: signImageUrl }}
              // Apply hiddenMedia if it's the video's turn
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
              numberOfLines={2} // Limit to two lines for long words
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