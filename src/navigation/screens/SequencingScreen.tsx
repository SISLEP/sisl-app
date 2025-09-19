// SequencingScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SequencingScreen = ({ data, onNext }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectWord = (word) => {
    // Hide feedback when the user starts a new attempt
    if (showFeedback) {
      setShowFeedback(false);
    }
    setSelectedWords([...selectedWords, word]);
  };

  const handleClear = () => {
    setSelectedWords([]);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    // Compare the selected sequence with the correct order
    const correct = JSON.stringify(selectedWords) === JSON.stringify(data.correctOrder);
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  // Renders the bottom bar with the "Check" button
  const renderCheckButton = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.checkButtonContainer,
          selectedWords.length === 0 ? styles.disabledButton : styles.enabledButton,
        ]}
        onPress={handleCheck}
        disabled={selectedWords.length === 0}
      >
        <Text style={styles.checkText}>Check</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders the feedback box after checking the answer
  const renderFeedback = () => {
    const feedbackStyle = isCorrect ? styles.correctFeedback : styles.incorrectFeedback;
    const feedbackTextStyle = isCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText;
    const feedbackTitle = isCorrect ? 'Great job! 👍' : 'Not quite';

    return (
      <View style={[styles.feedbackContainer, feedbackStyle]}>
        <View>
          <Text style={feedbackTextStyle}>{feedbackTitle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, isCorrect ? styles.correctContinue : styles.incorrectContinue]}
          onPress={isCorrect ? onNext : handleClear} // Go to next lesson or clear and try again
        >
          <Text style={styles.continueButtonText}>{isCorrect ? 'Continue' : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick out signs in the correct order</Text>
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: data.signVideo }}
          style={styles.mainVideo}
          paused={false}
          repeat={true}
          resizeMode="contain"
        />
      </View>
      <View style={styles.answerArea}>
        <View style={styles.answerContainer}>
          <Text style={styles.answerText} numberOfLines={2}>
            {selectedWords.length > 0 ? selectedWords.join(' ') : ' '}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => (
          <TouchableOpacity
            key={`${option}-${index}`} // Ensure key is unique if options can repeat
            style={styles.optionButton}
            onPress={() => handleSelectWord(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.footer}>
        {showFeedback ? renderFeedback() : renderCheckButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
    overflow: 'hidden',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
  },
  answerArea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  answerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  answerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    width: '100%',
    marginTop: 'auto', // Pushes the footer to the bottom
  },
  bottomNav: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  checkButtonContainer: {
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
    padding: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Using absolute positioning to overlay on top of content if needed
    position: 'absolute',
    bottom: -20, // Adjust if it doesn't align correctly
    left: -20,
    right: -20,
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

export default SequencingScreen;