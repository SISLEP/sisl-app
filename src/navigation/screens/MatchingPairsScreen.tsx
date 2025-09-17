// MatchingPairsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

const MatchingPairsScreen = ({ data, onNext }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // When a video or text card is selected, reset the feedback state
  const handleSelectVideo = (item) => {
    console.log("myy selected video", item);
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
    const correct = selectedVideo.id === selectedText.id;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  // Renders the initial bottom bar with the "Check" button
  const renderCheckButton = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.buttonContainer}>
        <Text style={styles.buttonText}>🐢 Speed</Text>
      </TouchableOpacity>
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
    </View>
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
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="bookmark-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Tap the matching pair</Text>
      <View style={styles.gridContainer}>
        {data.items.map((item) => {
          const isSelected = selectedVideo?.id === item.id;
          console.log("myy ", isSelected);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, isSelected && styles.selectedCard]}
              onPress={() => handleSelectVideo(item)}
            >
              <Video
                source={{ uri: item.signVideo }}
                style={styles.video}
                paused={false} // This is the change to enable autoplay
                repeat={true} // Add this to loop the video
                resizeMode="contain"
              />
            </TouchableOpacity>
          );
        })}
        {data.items.map((item) => {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
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