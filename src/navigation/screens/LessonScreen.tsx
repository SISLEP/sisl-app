// LessonScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
// Remove Alert as it's no longer used
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import FillInTheBlankScreen from './FillInTheBlankScreen';
import MatchingPairsScreen from './MatchingPairsScreen';
import SequencingScreen from './SequencingScreen';
import TranslationScreen from './TranslationScreen';

const LessonScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lessons } = route.params;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = lessons[currentLessonIndex];

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      // End of module, navigate to the completion screen
      navigation.navigate('LessonComplete');
    }
  };

  const renderLessonComponent = () => {
    if (!currentLesson) return <Text>No lesson data available.</Text>;

    switch (currentLesson.type) {
      case 'matching_pairs':
        return <MatchingPairsScreen data={currentLesson.data} onNext={handleNextLesson} />;
      case 'sequencing':
        return <SequencingScreen data={currentLesson.data} onNext={handleNextLesson} />;
      case 'translation':
        return <TranslationScreen data={currentLesson.data} onNext={handleNextLesson} />;
      case 'fill_in_the_blank':
        return <FillInTheBlankScreen data={currentLesson.data} onNext={handleNextLesson} />;
      default:
        return <Text>Unknown lesson type: {currentLesson.type}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderLessonComponent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default LessonScreen;