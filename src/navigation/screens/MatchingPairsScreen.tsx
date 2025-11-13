// MatchingPairsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

// Simple shuffling function (Fisher-Yates)
const shuffleArray = (array) => {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MatchingPairsScreen = ({ data, onNext }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // State for Shuffled Cards
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [shuffledTexts, setShuffledTexts] = useState([]);

  // State to ensure videos only start playing after they have loaded
  const [videoLoaded, setVideoLoaded] = useState({});

  // Effect to Shuffle Cards on Mount
  useEffect(() => {
    if (data && data.items) {
      // Shuffle data.items separately for videos and texts
      setShuffledVideos(shuffleArray(data.items));
      setShuffledTexts(shuffleArray(data.items));
    }
  }, [data]); // Re-run if data changes

  // When a video or text card is selected, reset the feedback state
  const handleSelectVideo = (item) => {
    setSelectedVideo(item);
    setShowFeedback(false);
  };

  const handleSelectText = (item) => {
    setSelectedText(item);
    setShowFeedback(false);
  };

  // Check if the selected pair is correct
  const handleCheck = () => {
    if (!selectedVideo || !selectedText) {
      return; // Do nothing if a pair isn't fully selected
    }
    // Simple ID matching logic is used as there are no distractors
    const correct = selectedVideo.id === selectedText.id;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  // Set a video's ID as loaded once its asset is ready
  const handleVideoLoad = (videoId) => {
    setVideoLoaded(prev => ({ ...prev, [videoId]: true }));
  };


  // Renders the initial bottom bar with the "Check" button
  const renderCheckButton = () => (
    <SafeAreaView style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.checkButtonContainer,
          !selectedVideo || !selectedText ? styles.disabledButton : styles.enabledButton,
        ]}
        onPress={handleCheck}
        disabled={!selectedVideo || !selectedText}
      >
        <Text style={styles.checkText}>Check</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Renders the feedback box after checking the answer
  const renderFeedback = () => {
    const feedbackStyle = isCorrect ? styles.correctFeedback : styles.incorrectFeedback;
    const feedbackTextStyle = isCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText;
    const feedbackTitle = isCorrect ? 'Excellent! 🎉' : 'Incorrect';
    
    return (
      <View style={[styles.feedbackContainer, feedbackStyle]}>
        <View>
          <Text style={feedbackTextStyle}>{feedbackTitle}</Text>
          {isCorrect && <Text style={styles.feedbackSubtitle}>You matched the pair correctly.</Text>}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, isCorrect ? styles.correctContinue : styles.incorrectContinue]}
          onPress={isCorrect ? onNext : () => setShowFeedback(false)}
        >
          <Text style={styles.continueButtonText}>{isCorrect ? 'Continue' : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap the matching pair</Text>
      <View style={styles.gridContainer}>
        {/* Use shuffledVideos for randomized order */}
        {shuffledVideos.map((item) => {
          const isSelected = selectedVideo?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, isSelected && styles.selectedCard]}
              onPress={() => handleSelectVideo(item)}
            >
              <View pointerEvents='none' style ={styles.videoView}>
              <Video
                source={{ uri: item.signVideo }}
                style={styles.video}
                // 💡 CONTROL PLAYBACK: Paused is true until the video loads
                paused={!videoLoaded[item.id]} 
                repeat={true} 
                resizeMode="contain"
                // 💡 ON LOAD: Call the handler to mark this video as loaded
                onLoad={() => handleVideoLoad(item.id)}
                // Keep muted true for widest compatibility if you don't need audio
                muted={true} 
                disableFocus={true}
              />
              </View>
            </TouchableOpacity>
          );
        })}
        {/* Use shuffledTexts for randomized order */}
        {shuffledTexts.map((item) => {
          const isSelected = selectedText?.id === item.id;
          return (
            <TouchableOpacity
              key={`${item.id}-text`}
              style={[styles.itemCard, styles.textCard, isSelected && styles.selectedCard]}
              onPress={() => handleSelectText(item)}
            >
              <Text style={styles.cardText}>{item.translation}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showFeedback ? renderFeedback() : renderCheckButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    flex: 1,
  },
  itemCard: {
    width: '45%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#84D8FF',
    backgroundColor: '#EBF8FF',
  },
  textCard: {
    backgroundColor: '#E6E8EA',
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
  },
  bottomNav: {
    paddingVertical: 20,
  },
  buttonContainer: {
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  checkButtonContainer: {
    width: '100%', 
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  enabledButton: {
    backgroundColor: '#58CC02',
  },
  disabledButton: {
    backgroundColor: '#E6E8EA',
  },
  checkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Feedback styles
  feedbackContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Extra padding for home indicator area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  correctFeedback: {
    backgroundColor: '#D7FFB8',
  },
  incorrectFeedback: {
    backgroundColor: '#FFDFE0',
  },
  correctFeedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#58A700',
  },
  incorrectFeedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EA2B2B',
  },
  feedbackSubtitle: {
    color: '#777',
    fontSize: 14,
  },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  correctContinue: {
    backgroundColor: '#58CC02',
  },
  incorrectContinue: {
    backgroundColor: '#FF4B4B',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchingPairsScreen;