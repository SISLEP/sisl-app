// TranslationScreen.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

const TranslationScreen = ({ data, instructions, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === data.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  };
  
  // Renders the bottom bar with the "Check" button
  const renderCheckButton = () => (
    <SafeAreaView style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.checkButtonContainer,
          !selectedOption ? styles.disabledButton : styles.enabledButton,
        ]}
        onPress={handleCheck}
        disabled={!selectedOption}
      >
        <Text style={styles.checkText}>Check</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Renders the feedback box after checking the answer
  const renderFeedback = () => {
    const feedbackStyle = isCorrect ? styles.correctFeedback : styles.incorrectFeedback;
    const feedbackTextStyle = isCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText;
    const feedbackTitle = isCorrect ? 'You are correct! 💯' : 'That\'s not it.';
    
    return (
      <View style={[styles.feedbackContainer, feedbackStyle]}>
        <View>
          <Text style={feedbackTextStyle}>{feedbackTitle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, isCorrect ? styles.correctContinue : styles.incorrectContinue]}
          onPress={isCorrect ? onNext : handleTryAgain}
        >
          <Text style={styles.continueButtonText}>{isCorrect ? 'Continue' : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{instructions || 'Guess the correct translation'}</Text>
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: data.signVideo }} // Note: Your JSON has `signImage`, ensure you pass `signVideo`
            style={styles.mainVideo}
            paused={false}
            repeat={true}
            resizeMode="contain"
          />
        </View>
        <View style={styles.optionsContainer}>
          {data.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedButton,
              ]}
              onPress={() => handleSelectOption(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          {showFeedback ? renderFeedback() : renderCheckButton()}
        </View>
      </ScrollView>
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
  optionsContainer: {
    width: '100%',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#84D8FF',
    backgroundColor: '#EBF8FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
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
  feedbackContainer: {
    padding: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
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

export default TranslationScreen;