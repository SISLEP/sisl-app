/**
 * @fileoverview This file contains the API service for fetching various data structures with a local fallback using a generic helper.
 */

// Import the local JSON data to use as fallbacks.
// IMPORTANT: Update imports to use the new categorized file structure
import alphabetModulesData from '../assets/data/alphabet.json';
import bodyModulesData from '../assets/data/body.json';
import familyModulesData from '../assets/data/family.json';
import monthModulesData from '../assets/data/month.json';
import colourModulesData from '../assets/data/colour.json';
import provinceModulesData from '../assets/data/province.json';
import animalModulesData from '../assets/data/animal.json';
import sportModulesData from '../assets/data/sport.json';
import generalModulesData from '../assets/data/general.json';

import categoriesData from '../assets/data/categories.json'; // New category list data
// Assuming the user has a local dictionary JSON file at this path:
import localDictionaryData from '../assets/data/dictionary.json'; 

// Placeholder URLs for the hosted JSON files.
const CATEGORIES_DATA_URL = 'https://sislep.github.io/video-site/categories.json'; // New URL
// Base URL for the new modular module structure
const MODULES_BASE_URL = 'https://sislep.github.io/video-site/'; 
const DICTIONARY_DATA_URL = 'https://sislep.github.io/video-site/dictionary.json';

// Map category IDs to their local module data imports
const localModuleDataMap: { [key: string]: { [key: string]: LearningModule[] } } = {
    alphabet: alphabetModulesData,
    body: bodyModulesData,
    family: familyModulesData,
    month: monthModulesData,
    colour: colourModulesData,
    province: provinceModulesData,
    animal: animalModulesData,
    sport: sportModulesData,
    general: generalModulesData,
    // Add other categories as needed
};

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
 * Interface for the response structure of a single category's modules.
 */
interface CategoryModulesResponse {
    [categoryId: string]: LearningModule[];
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
 * Fetches all learning modules for a specific category.
 *
 * @param {string} categoryId The ID of the category (e.g., 'alphabet', 'body').
 * @returns {Promise<LearningModule[]>} A promise that resolves with an array of modules for that category.
 */
const fetchModulesByCategory = async (categoryId: string): Promise<LearningModule[]> => {
    // Construct the specific URL for the category's JSON file
    const url = `${MODULES_BASE_URL}${categoryId}.json`;
    // Get the corresponding local fallback data
    const localData = localModuleDataMap[categoryId];

    if (!localData) {
        console.warn(`No local data found for category: ${categoryId}`);
        return [];
    }

    const response = await fetchData<CategoryModulesResponse>(
        url,
        localData as CategoryModulesResponse,
        `${categoryId} modules`
    );

    // The response is an object with one key (the categoryId) pointing to the array of modules
    return response[categoryId] || [];
};

/**
 * Fetches ALL learning modules, flattened into a single array.
 * This function is used for logic that needs all modules, like the 'Continue' button logic.
 *
 * @returns {Promise<LearningModule[]>} A promise that resolves with a flattened array of all learning modules.
 */
const fetchAllModules = async (): Promise<LearningModule[]> => {
    // 1. Get the list of all category IDs
    const categories = await fetchCategories();
    const categoryIds = categories.map(c => c.id);

    // 2. Fetch modules for all categories concurrently
    const modulePromises = categoryIds.map(id => fetchModulesByCategory(id));
    const modulesArrays = await Promise.all(modulePromises);

    // 3. Flatten the array of arrays into a single array
    const allModules = modulesArrays.flat();
    
    console.log(`Total learning modules fetched and flattened: ${allModules.length}`);
    return allModules;
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

// Export the updated functions
export { 
    fetchCategories, 
    fetchModulesByCategory, // Export the new function
    fetchAllModules, 
    fetchDictionaryData, 
    fetchAllWords 
};

// Removed fetchCategorizedModules as it is no longer required with the new structure