/**
 * @fileoverview This file contains the API service for fetching various data structures with a local fallback using a generic helper.
 */

// import * as FileSystem from 'expo-file-system'; // 🚨 UPDATED: Import the standard FileSystem API
import { Directory, File, Paths, documentDirectory } from 'expo-file-system';

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
const CATEGORIES_DATA_URL = 'https://sislep.github.io/video-site/lessons/categories.json'; // New URL
// Base URL for the new modular module structure
const MODULES_BASE_URL = 'https://sislep.github.io/video-site/lessons/'; 
const DICTIONARY_DATA_URL = 'https://sislep.github.io/video-site/dictionary.json';

// --- NEW: Offline Storage Configuration ---
// Files will be saved in the document directory, which is persistent (not cleared automatically like cache).
const OFFLINE_VIDEOS_BASE_DIR = `${documentDirectory}/offline_videos/`;

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

// --- Interfaces for Data Structures (Omitted for brevity, kept same as original) ---

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

// --- Generic Fetch Function (Omitted for brevity, kept same as original) ---

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

// --- Specific Fetch Functions using the Generic Helper (Omitted for brevity, kept same as original) ---

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

// --- NEW: Offline Video Management Functions ---

/**
 * Helper to get the local directory URI for a specific category's videos.
 * @param categoryId The ID of the category (e.g., 'alphabet').
 * @returns The file:// URI for the category's local video folder.
 */
const getCategoryDirectory = (categoryId: string): Directory => {
    // The directory structure is Paths.document / "sislep" / categoryId
    return new Directory(Paths.document, "sislep", categoryId);
};

/**
 * Helper to determine the local file URI for a given remote URL.
 * This does NOT check if the file exists, it only calculates the path.
 *
 * @param remoteUrl The original remote URL of the video/image.
 * @param categoryId The ID of the category (e.g., 'alphabet').
 * @returns The expected local file URI string.
 */
const getLocalVideoUri = (remoteUrl: string, categoryId: string): string => {
    // 1. Get the directory object
    const dir = getCategoryDirectory(categoryId);

    // 2. Extract the filename from the URL (e.g., "https://.../Alphabet/A.mp4" -> "A.mp4")
    const filename = remoteUrl.substring(remoteUrl.lastIndexOf('/') + 1);

    // 3. Construct the full local URI: <base-document-uri>/sislep/<categoryId>/<filename>
    return `${dir.uri}/${filename}`;
};

/**
 * Checks if a specific file (video or image) is downloaded locally.
 *
 * @param remoteUrl The original remote URL used to download the file.
 * @param categoryId The ID of the category.
 * @returns A promise that resolves to true if the file exists locally, false otherwise.
 */
const isFileDownloaded = async (remoteUrl: string, categoryId: string): Promise<boolean> => {
    const localUri = getLocalVideoUri(remoteUrl, categoryId);
    try {
        // Use the File class to check for existence
        const file = new File(localUri);
        return file.exists;
    } catch (e) {
        console.error(`Error checking file existence for ${localUri}:`, e);
        return false;
    }
};

/**
 * Determines the best source (local URI or remote URL) for a video/image.
 * It prefers the local file if it exists, falling back to the remote URL.
 * * @param remoteUrl The original remote URL.
 * @param categoryId The ID of the category.
 * @param isCategoryDownloaded Whether the entire category is marked as downloaded (as a quick check).
 * @returns A promise that resolves to the local URI (if found) or the original remote URL.
 */
const getBestVideoSource = async (
    remoteUrl: string, 
    categoryId: string,
    isCategoryDownloaded: boolean
): Promise<string> => {
    // Only bother checking the file system if the category is marked as fully downloaded
    if (isCategoryDownloaded) {
        const localUri = getLocalVideoUri(remoteUrl, categoryId);
        console.log("myy checking ", localUri)

        
        const fileExists = await isFileDownloaded(remoteUrl, categoryId);

        if (fileExists) {
            console.log(`Using local file for ${remoteUrl}: ${localUri}`);
            return localUri;
        }
    }
    console.log(`Using remote URL for ${remoteUrl}`);
    // Fallback to the original remote URL if the category isn't downloaded or file is missing
    return remoteUrl;
};


/**
 * Helper to ensure the local category directory exists.
 * @param categoryId The ID of the category.
 */
const ensureCategoryDirectoryExists = async (categoryId: string): Promise<void> => {
    const dir = new Directory(Paths.document, "sislep", categoryId);
    if (!dir.exists) {
        console.log(`Creating directory: ${dir.name}`);
        // `intermediates: true` creates all necessary parent directories.
        await dir.create({ intermediates: true }); 
    }
};

/**
 * Helper to get all video URLs (signVideo and signImage) for a category.
 * This checks the local fallback dictionary data, as the API fetch for
 * categories in Home.tsx doesn't provide all sign video links.
 * NOTE: The category ID in fetchModulesByCategory is lowercase, but the keys
 * in dictionary.json start with a capital letter (e.g., 'Alphabet', 'Body').
 * This function handles the case discrepancy.
 *
 * @param categoryId The lowercase ID of the category (e.g., 'alphabet').
 * @returns An array of unique video and image URLs for the category.
 */
const getCategoryVideoUrls = (categoryId: string): string[] => {
    // Convert to the expected casing for the dictionary key (e.g., 'alphabet' -> 'Alphabet')
    const dictionaryKey = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    
    // Get the words array for the category from the local fallback dictionary data
    const words = localDictionaryData[dictionaryKey] as DictionaryWord[] || [];
    
    const urls = words.flatMap(word => {
        const videoUrl = word.signVideo;
        const imageUrl = word.signImage;
        const result: string[] = [videoUrl];
        if (imageUrl) {
            result.push(imageUrl);
        }
        return result;
    }).filter(url => url && url.startsWith('http')); // Filter out undefined/null and ensure it's a remote URL
    
    // Return only unique URLs
    return Array.from(new Set(urls));
};

/**
 * Downloads all videos and images for a given category to local storage.
 * @param categoryId The ID of the category (e.g., 'alphabet').
 */
export const downloadCategoryVideos = async (categoryId: string): Promise<void> => {
    await ensureCategoryDirectoryExists(categoryId);
    const urls = getCategoryVideoUrls(categoryId);
    const dir = getCategoryDirectory(categoryId);
    
    console.log(`Starting download for ${urls.length} files in category ${categoryId}`);

    const downloadPromises = urls.map(url => {
        // Extract the filename from the URL (e.g., "https://.../Alphabet/A.mp4" -> "A.mp4")
        const filename = url.substring(url.lastIndexOf('/') + 1);
        // const fileUri = `${dirUri}${filename}`;
        
        // Use downloadAsync for downloading the file
        return File.downloadFileAsync(url, dir)
            .then(result => {
                if (!result.exists) {
                    throw new Error(`Download failed with status ${result.status}`);
                }
                console.log(`Downloaded ${filename} to ${dir}`);
            })
            .catch(error => {
                console.error(`Error downloading ${filename}:`, error);
                // Throw an error to ensure Promise.all fails if any file fails
                throw new Error(`Failed to download file ${filename}`); 
            });
    });

    await Promise.all(downloadPromises);
    console.log(`All files for category ${categoryId} downloaded successfully.`);
};

/**
 * Checks if all videos/images for a category are fully downloaded.
 * This is a simple check: it verifies the directory exists and contains the
 * expected number of files.
 * @param categoryId The ID of the category (e.g., 'alphabet').
 * @returns A promise that resolves to true if all files are downloaded, false otherwise.
 */
export const isCategoryFullyDownloaded = async (categoryId: string): Promise<boolean> => {
    const dir = getCategoryDirectory(categoryId);

    if (!dir.exists) {
        return false;
    }

    const expectedUrls = getCategoryVideoUrls(categoryId);
    
    try {
        const downloadedFiles = dir.list();
        
        // Check if the number of files matches the expected number of URLs
        return downloadedFiles.length === expectedUrls.length;
    } catch (e) {
        console.error('Error reading category directory:', e);
        return false;
    }
};

/**
 * Removes all downloaded videos/images for a category.
 * @param categoryId The ID of the category (e.g., 'alphabet').
 */
export const removeCategoryVideos = async (categoryId: string): Promise<void> => {
    const dir = getCategoryDirectory(categoryId);

    if (dir.exists) {
        console.log(`Removing directory: ${dir.name}`);
        // Use deleteAsync with the recursive option
        await dir.delete();
        console.log(`Category videos removed for ${categoryId}.`);
    } else {
        console.warn(`Attempted to remove non-existent directory for category: ${categoryId}`);
    }
};


export { 
    fetchCategories, 
    fetchModulesByCategory, 
    fetchDictionaryData, 
    fetchAllWords,
    // 🚨 NEW EXPORTS for offline file resolution
    getLocalVideoUri,
    isFileDownloaded,
    getBestVideoSource,
};