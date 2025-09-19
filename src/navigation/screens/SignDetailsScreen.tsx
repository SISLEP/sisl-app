// screens/SignDetailsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video'; // Change: Import Video and remove Image
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SignDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, initialIndex, words: allWords } = route.params;

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    // Use the words passed from the previous screen
    setWords(allWords);
  }, [allWords]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
  };

  if (words.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No signs available for this category.</Text>
      </View>
    );
  }

  const currentSign = words[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Sign Video Section */}
        <View style={styles.signVideoContainer}>
          <Video
            source={{ uri: currentSign.signVideo }} // Use the video source from the data
            style={styles.signVideo}
            paused={false} // Autoplay the video
            repeat={true} // Loop the video
            resizeMode="contain"
          />
          <View style={styles.signOverlay}>
            <Text style={styles.signOverlayText}>{currentSign.word}</Text>
          </View>
        </View>

        {/* Navigation Section */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevious}>
            <Icon name="arrow-back-ios" size={30} color="#FF9500" />
          </TouchableOpacity>
          <View style={styles.currentSignContainer}>
            <Icon name="keyboard-arrow-up" size={24} color="#666" />
            <Text style={styles.currentSignText}>Current sign</Text>
            <Text style={styles.currentSignWord}>{currentSign.word}</Text>
          </View>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
            <Icon name="arrow-forward-ios" size={30} color="#FF9500" />
          </TouchableOpacity>
        </View>

        {/* Bottom Menu */}
        <View style={styles.bottomMenu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text>🐢</Text>
            <Text style={styles.menuItemText}>Speed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text>🤔</Text>
            <Text style={styles.menuItemText}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text>🗂️</Text>
            <Text style={styles.menuItemText}>Flashcards</Text>
          </TouchableOpacity>
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
  // Change: New styles for video container and video component
  signVideoContainer: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signVideo: {
    width: '100%',
    height: '100%',
  },
  signOverlay: {
    position: 'absolute',
    bottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  signOverlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  arrowButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#FFF5E6',
  },
  currentSignContainer: {
    alignItems: 'center',
  },
  currentSignText: {
    fontSize: 14,
    color: '#666',
  },
  currentSignWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
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