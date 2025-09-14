// FillInTheBlankScreen.tsx
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FillInTheBlankScreen = ({ data, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === data.missingWord;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  };
  
  const phraseWithSelection = data.fullPhrase.replace('____', selectedOption || '____');

  // Renders the bottom bar with the "Check" button
  const renderCheckButton = () => (
    <View style={styles.bottomNav}>
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
    </View>
  );

  // Renders the feedback box after checking the answer
  const renderFeedback = () => {
    const feedbackStyle = isCorrect ? styles.correctFeedback : styles.incorrectFeedback;
    const feedbackTextStyle = isCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText;
    const feedbackTitle = isCorrect ? 'Spot on! 🙌' : 'That\'s not the one.';

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
      <Text style={styles.title}>Fill in the missing sign</Text>
      <View style={styles.imageContainer}>
        <Image source={{ uri: data.signImage }} style={styles.mainImage} />
      </View>
      <View style={styles.phraseContainer}>
        <Text style={styles.phraseText}>{phraseWithSelection}</Text>
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
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  phraseContainer: {
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#ccc',
  },
  phraseText: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
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
  selectedButton: {
    backgroundColor: '#84D8FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
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
    bottom: -20,
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

export default FillInTheBlankScreen;