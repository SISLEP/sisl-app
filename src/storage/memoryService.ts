// services/memoryService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../data/word'; // Assuming Word type is here

const MEMORY_KEY = '@wordMemory';

type Rating = 'Badly' | 'Partly' | 'Well';

interface WordMemory {
  [wordId: string]: {
    score: number; // A simple score. 0 = unknown, higher = better known
    lastSeen: number;
  };
}

/**
 * Gets the entire memory score object from AsyncStorage.
 */
const getMemoryScores = async (): Promise<WordMemory> => {
  try {
    // Check for global definition before using.
    if (typeof AsyncStorage === 'undefined') {
      console.warn('AsyncStorage is not available. Using mock memory.');
      return {};
    }
    const data = await AsyncStorage.getItem(MEMORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to get memory scores', e);
    return {};
  }
};

/**
 * Saves a new score for a word based on user rating.
 */
export const saveWordMemory = async (wordId: string, rating: Rating) => {
  try {
    if (typeof AsyncStorage === 'undefined') {
      console.warn('AsyncStorage is not available. Memory not saved.');
      return;
    }

    const scores = await getMemoryScores();
    // Ensure wordId is present and valid
    if (!wordId || wordId.trim() === '') {
        console.error('Invalid wordId provided to saveWordMemory');
        return;
    }

    const currentScore = scores[wordId]?.score || 0;
    let newScore = currentScore;

    // Logic to reduce frequency for less remembered words (lower score = higher frequency)
    switch (rating) {
      case 'Badly':
        // NOTE: When a word is new (score is 0), setting to -2 ensures it gets prioritized.
        newScore = Math.max(0, currentScore - 2); // Decrease score significantly
        break;
      case 'Partly':
        newScore = currentScore; // No change
        break;
      case 'Well':
        newScore = currentScore + 1; // Increase score
        break;
    }

    scores[wordId] = {
      score: newScore,
      lastSeen: Date.now(),
    };

    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(scores));
  } catch (e) {
    console.error('Failed to save word memory', e);
  }
};

/**
 * NEW: Adds a word to memory *only* if it is not already present.
 * It initializes the word with a 'Badly' score (score 0 by default).
 */
export const addWordMemory = async (wordId: string) => {
  try {
    if (typeof AsyncStorage === 'undefined') {
      console.warn('AsyncStorage is not available. Memory not saved.');
      return;
    }

    const scores = await getMemoryScores();
    
    // Check if the wordId is already in memory
    if (scores[wordId]) {
      console.log(`Word '${wordId}' is already in memory. Skipping addition.`);
      return;
    }

    // If not present, save it, which initializes its score and lastSeen time.
    // We use the same 'Badly' logic as saveWordMemory for initialization.
    scores[wordId] = {
      score: 0, // Initial score for a newly added word.
      lastSeen: Date.now(),
    };

    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(scores));
    console.log(`Word '${wordId}' added to memory for the first time.`);

  } catch (e) {
    console.error('Failed to add word to memory', e);
  }
};

/**
 * Gets a list of words for a session, prioritizing
 * words that are less known (lower score).
 */
export const getWordsForSession = async (
  allWords: Word[],
  count: number,
): Promise<Word[]> => {
  if (allWords.length === 0) {
    return [];
  }
  if (allWords.length <= count) {
    return allWords; // Not enough words to pick from
  }

  const scores = await getMemoryScores();

  // Map words to include their score, defaulting to 0
  const scoredWords = allWords.map((word) => ({
    ...word,
    score: scores[word.word]?.score || 0,
    lastSeen: scores[word.word]?.lastSeen || 0,
  }));

  // Sort by score (ascending) then by lastSeen (ascending)
  // This prioritizes:
  // 1. Words with the lowest score (Badly remembered words)
  // 2. Among words with the same score, the one seen longest ago (Spaced repetition effect)
  const sortedWords = scoredWords.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score; // Sort by score ascending
    }
    return a.lastSeen - b.lastSeen; // If scores are equal, sort by lastSeen ascending (oldest first)
  });

  // Return the requested number of words from the top of the sorted list
  return sortedWords.slice(0, count);
};

/**
 * Gets a list of all word IDs (strings) that currently have memory scores.
 */
export const getAllWordsLearned = async (): Promise<string[]> => {
  try {
    const scores = await getMemoryScores();
    return Object.keys(scores);
  } catch (e) {
    console.error('Failed to get all learned words', e);
    return [];
  }
};