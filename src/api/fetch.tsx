/**
 * @fileoverview This file contains the API service for fetching various data structures with a local fallback using a generic helper.
 */

// Import the local JSON data to use as fallbacks.
// IMPORTANT: Update imports to use the new categorized file structure
import categorizedModulesData from '../assets/data/categorizedModules.json'; // New module data
import categoriesData from '../assets/data/categories.json'; // New category list data
// Assuming the user has a local dictionary JSON file at this path:
import localDictionaryData from '../assets/data/dictionary.json'; 

// Placeholder URLs for the hosted JSON files.
const CATEGORIES_DATA_URL = 'https://sislep.github.io/video-site/categories.json'; // New URL
const MODULES_DATA_URL = 'https://sislep.github.io/video-site/categorizedModules.json'; // Updated URL
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
  category: string; // Added category property
  lessons: any[]; // Assuming lessons exist based on Home.tsx usage
}

/**
 * Interface for the categorized modules data structure.
 * Keys are category IDs, values are arrays of modules.
 */
interface CategorizedModulesResponse {
  [categoryId: string]: LearningModule[];
}

/**
 * Interface for a single category item.
 */
export interface CategoryItem {
    id: string;
    title: string;
    icon: string;
    bgColor: string;
    moduleCount: number;
}

/**
 * Interface for the fetched category list structure.
 */
interface CategoriesResponse {
  categories: CategoryItem[];
}

/**
 * Interface for a single dictionary word item.
 */
export interface DictionaryWord {
  word: string;
  signVideo: string;
  signImage?: string;
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
 * Fetches the list of learning categories.
 *
 * @returns {Promise<CategoryItem[]>} A promise that resolves with an array of category items.
 */
const fetchCategories = async (): Promise<CategoryItem[]> => {
  const response = await fetchData<CategoriesResponse>(
    CATEGORIES_DATA_URL,
    categoriesData as CategoriesResponse,
    'categories list'
  );
  // Extract the categories array from the response object
  return response.categories;
};

/**
 * Fetches ALL learning modules, grouped by category ID.
 * The network request expects the shape of CategorizedModulesResponse.
 *
 * @returns {Promise<CategorizedModulesResponse>} A promise that resolves with an object of learning modules grouped by category.
 */
const fetchCategorizedModules = async (): Promise<CategorizedModulesResponse> => {
  return fetchData<CategorizedModulesResponse>(
    MODULES_DATA_URL,
    categorizedModulesData as CategorizedModulesResponse, // Type cast local data to match expected response structure
    'categorized learning modules'
  );
};

/**
 * Fetches ALL learning modules, flattened into a single array (for legacy use like 'Continue' button).
 * * @returns {Promise<LearningModule[]>} A promise that resolves with a flattened array of all learning modules.
 */
const fetchAllModules = async (): Promise<LearningModule[]> => {
    const categorizedModules = await fetchCategorizedModules();
    // Flatten the object of arrays into a single array of LearningModule objects
    return Object.values(categorizedModules).flat();
}

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

// Export the updated functions
export { fetchCategories, fetchCategorizedModules, fetchAllModules, fetchDictionaryData, fetchAllWords };