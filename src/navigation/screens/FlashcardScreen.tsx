// screens/FlashcardScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { saveWordMemory } from '../../storage/memoryService';

// Define the Word type. It now uses 'signVideo' as confirmed in DictionaryWords.tsx
export interface Word {
  id: string;
  word: string;
  definition: string;
  signVideo: string; // Video URL property
}

type FlowType = 'wordToSign' | 'signToWord';
type Rating = 'Badly' | 'Partly' | 'Well';

// Simple progress bar component
const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progress = (current / total) * 100;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );
};

// Component to display the Sign Video using the provided URL
const FlashcardVideoDisplay = ({ word }: { word: Word }) => {
  const videoKey = `flashcard-sign-video-${word.word}`; 
  
  return (
    <View style={styles.videoContainer}>
      <Video
        key={videoKey}
        source={{ uri: word.signVideo }}
        style={styles.videoPlayer}
        paused={false}
        repeat={true}
        resizeMode="contain"
        muted={true}
      />
    </View>
  );
};

const FlashcardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { flashcardWords } = route.params as { flashcardWords: Word[] };

  const [words] = useState<Word[]>(flashcardWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [flowType, setFlowType] = useState<FlowType>('wordToSign');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  const currentWord = words[currentIndex];

  const handleClose = () => {
    navigation.goBack();
  };

  const handleToggleFlow = () => {
    setFlowType(flowType === 'wordToSign' ? 'signToWord' : 'wordToSign');
  };

  const handleContinue = () => {
    // Shows the answer screen
    setIsShowingAnswer(true);
  };

  const handleRatingSelect = (rating: Rating) => {
    setSelectedRating(rating);
  };

  const handleAnswer = async () => {
    if (!selectedRating) return;

    // Save the memory score using the service
    await saveWordMemory(currentWord.word, selectedRating);

    // Move to the next card
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsShowingAnswer(false);
      setSelectedRating(null);
    } else {
      // End of session, navigate back with a success message (optional)
      Alert.alert(
        'Session Complete',
        `You reviewed ${words.length} words!`,
        [{ text: 'OK', onPress: handleClose }],
      );
    }
  };

  const renderQuestion = () => (
    // Question view remains a fixed View
    <View style={styles.contentContainer}>
      {/* Scrollable content inside the main container */}
      <ScrollView contentContainerStyle={styles.questionScrollContent}>
        {/* Dog image removed based on visual assumption from previous steps; 
            Re-adding a placeholder if it was intended to be there */}
        {flowType === 'wordToSign' && (
          <Image
            source={{
              uri: 'https://placehold.co/150x150/FFF0E1/333?text=🐶&font=noto-sans-emoji',
            }}
            style={styles.dogImage}
          />
        )}
        
        <Text style={styles.questionTitle}>
          {flowType === 'wordToSign'
            ? 'How do you sign:'
            : 'What does this sign mean?'}
        </Text>

        {flowType === 'wordToSign' ? (
          <Text style={styles.questionWord}>{currentWord.word}</Text>
        ) : (
          // This is the alternate flow: Sign video then word meaning
          <FlashcardVideoDisplay word={currentWord} />
        )}
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Show Answer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnswer = () => (
    // Answer view now uses ScrollView and a specific inner container style
    <View style={styles.answerScreenContainer}>
      <ScrollView contentContainerStyle={styles.answerScrollContent}>
        {/* The main answer display changes based on flow */}
        {flowType === 'wordToSign' ? (
          // Answer for "Word to Sign" is the video/sign details (screenshot 2 style)
          <View style={styles.answerSignDetail}>
            <FlashcardVideoDisplay word={currentWord} />
            <View style={styles.signLabel}>
              <Text style={styles.signLabelText}>{currentWord.word}</Text>
            </View>
          </View>
        ) : (
          // Answer for "Sign to Word" is the English word/meaning
          <View style={styles.answerWordDetail}>
            <Text style={styles.answerWord}>{currentWord.word}</Text>
            <Text style={styles.answerDefinition}>{currentWord.definition}</Text>
          </View>
        )}

        <Text style={styles.ratingTitle}>How well did you remember this?</Text>
        <View style={styles.ratingContainer}>
          {(['Badly', 'Partly', 'Well'] as Rating[]).map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingOption,
                selectedRating === rating && styles.ratingOptionSelected,
              ]}
              onPress={() => handleRatingSelect(rating)}
            >
              {/* Custom face/emoji based on screenshot 2 */}
              <View
                style={[
                  styles.ratingFace,
                  { backgroundColor: selectedRating === rating ? '#FFD166' : '#f0f0f0' },
                ]}
              >
                <Text style={{ fontSize: 40 }}>
                  {rating === 'Badly' ? '😔' : rating === 'Partly' ? '😐' : '😊'}
                </Text>
              </View>
              <Text
                style={[
                  styles.ratingText,
                  selectedRating === rating && { color: '#333', fontWeight: 'bold' },
                ]}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Button remains absolute, but positioned higher for clearance */}
      <TouchableOpacity
        style={[
          styles.answerButton,
          !selectedRating && styles.buttonDisabled,
        ]}
        onPress={handleAnswer}
        disabled={!selectedRating}
      >
        <Text style={styles.answerButtonText}>Next Word</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={28} color="#aaa" />
        </TouchableOpacity>
        <ProgressBar current={currentIndex + 1} total={words.length} />
        {/* Toggle flow button */}
        <TouchableOpacity onPress={handleToggleFlow} style={styles.toggleButton}>
          <Icon name="swap-horiz" size={24} color="#333" />
          <Text style={styles.toggleText}>{flowType === 'wordToSign' ? 'Sign -> Word' : 'Word -> Sign'}</Text>
        </TouchableOpacity>
      </View>
      {isShowingAnswer ? renderAnswer() : renderQuestion()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  toggleText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  // Used for the Question screen (fixed content)
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    // REMOVED: justifyContent: 'center', <-- This was causing vertical centering
    padding: 20,
    position: 'relative',
  },
  // NEW STYLE: Content inside the ScrollView for the Question screen
  questionScrollContent: {
    alignItems: 'center',
    paddingBottom: 120, // To ensure content clears the absolute button
  },
  // New container for the Answer screen (to hold ScrollView and absolute button)
  answerScreenContainer: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 20,
  },
  // Content inside the ScrollView for the Answer screen
  answerScrollContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 120, // Add extra padding here to lift content above the button
  },
  dogImage: {
    width: 150,
    height: 150,
    marginBottom: 40,
    marginTop: 0, // Adjusted to start from the top of the ScrollView
  },
  questionTitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20, // Add a little space from the top of the scrollable area
  },
  questionWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  // Answer block for Sign to Word flow
  answerWordDetail: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 300,
  },
  answerWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  answerDefinition: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Answer block for Word to Sign flow
  answerSignDetail: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 300,
  },
  signLabel: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#333',
    zIndex: 10, // Ensure label is above video
  },
  signLabelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: 250, // Slightly taller container
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  // Continue button (Question screen)
  continueButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFD166',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  ratingOption: {
    alignItems: 'center',
    padding: 5,
  },
  ratingOptionSelected: {
    // Selection handled by the face border/color
  },
  ratingFace: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  // Answer Button (Answer screen)
  answerButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20, // Ensure button is always on top
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#B0C4DE',
  },
});

export default FlashcardScreen;