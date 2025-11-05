/**
 * @fileoverview This file contains the API service for fetching various data structures with a local fallback using a generic helper.
 */

// Import the local JSON data to use as fallbacks.
import learningModulesData from '../assets/data/learningModules.json';
// Assuming the user has a local dictionary JSON file at this path:
import localDictionaryData from '../assets/data/dictionary.json'; 

// Placeholder URLs for the hosted JSON files.
const MODULES_DATA_URL = 'https://sislep.github.io/video-site/learningModules.json';
const DICTIONARY_DATA_URL = 'https://sislep.github.io/video-site/dictionary.json';

// --- Interfaces for Data Structures ---

/**
 * Interface representing a single learning module.
 */
interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  lessons: any[]; // Assuming lessons exist based on Home.tsx usage
}

/**
 * Interface for the fetched learning modules data structure.
 */
interface LearningModulesResponse {
  learningModules: LearningModule[];
}

/**
 * Interface for a single dictionary word item.
 */
export interface DictionaryWord {
  id?: string; // Optional since it's not present in dictionary.json
  word: string;
  videoUrl?: string; // Original property - keeping for generic use
  signVideo: string; // Property found in dictionary.json
  signImage?: string; // Optional property found in dictionary.json
}

/**
 * Interface for the dictionary data structure (object where keys are categories).
 */
export interface DictionaryData {
  [category: string]: DictionaryWord[];
}

// --- Generic Fetch Function ---

/**
 * Generic function to fetch JSON data from a URL with a local fallback on failure.
 *
 * @template T The expected type of the data structure to be returned.
 * @param {string} url The URL of the hosted JSON file.
 * @param {T} fallbackData The local data to use if the network request fails.
 * @param {string} dataName A human-readable name for the data being fetched (for logging).
 * @returns {Promise<T>} A promise that resolves with the fetched or fallback data.
 */
const fetchData = async <T>(url: string, fallbackData: T, dataName: string): Promise<T> => {
  // Use AbortController for request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    console.log(`Attempting to fetch ${dataName} from network: ${url}`);
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      // If the response is not ok (e.g., 404, 500, or aborted), throw an error.
      throw new Error(`HTTP error! Status: ${response.status} for ${dataName}`);
    }

    const data: T = await response.json();
    console.log(`Successfully fetched ${dataName} from network.`);
    return data;
  } catch (error) {
    console.error(`Network request failed for ${dataName}. Falling back to local data:`, error);
    // On failure, return the local data.
    return fallbackData;
  } finally {
    clearTimeout(timeoutId); // Clean up the timeout regardless of success or failure
  }
};

// --- Specific Fetch Functions using the Generic Helper ---

/**
 * Fetches learning modules, using local data as a fallback.
 * The network request expects the shape of LearningModulesResponse.
 *
 * @returns {Promise<LearningModule[]>} A promise that resolves with an array of learning modules.
 */
const fetchLearningModules = async (): Promise<LearningModule[]> => {
  const response = await fetchData<LearningModulesResponse>(
    MODULES_DATA_URL,
    learningModulesData as LearningModulesResponse, // Type cast local data to match expected response structure
    'learning modules'
  );
  // Extract the modules array from the response object
  return response.learningModules;
};

/**
 * Fetches dictionary data, using local data as a fallback.
 * The network request expects the shape of DictionaryData (categories as keys).
 *
 * @returns {Promise<DictionaryData>} A promise that resolves with the dictionary data object.
 */
const fetchDictionaryData = async (): Promise<DictionaryData> => {
  // Assuming the dictionary.json is structured directly as DictionaryData { [category: string]: words[] }
  return fetchData<DictionaryData>(
    DICTIONARY_DATA_URL,
    localDictionaryData as DictionaryData, // Type cast local data to match expected structure
    'dictionary'
  );
};

/**
 * Fetches all dictionary words, flattening the category structure into a single array.
 *
 * @returns {Promise<DictionaryWord[]>} A promise that resolves with a flattened array of all dictionary words.
 */
const fetchAllWords = async (): Promise<DictionaryWord[]> => {
  const dictionaryData = await fetchDictionaryData();
  
  // Flatten the object of arrays into a single array of DictionaryWord objects
  const allWords = Object.values(dictionaryData).flat();
  
  console.log(`Total dictionary words fetched and flattened: ${allWords.length}`);
  return allWords;
};

export { fetchLearningModules, fetchDictionaryData, fetchAllWords };
