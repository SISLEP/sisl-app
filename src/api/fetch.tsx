/**
 * @fileoverview This file contains the API service for fetching various data structures with a local fallback using a generic helper.
 */

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
import classModulesData from '../assets/data/class.json';
import fruitModulesData from '../assets/data/fruit.json';
import gardenModulesData from '../assets/data/garden.json';
import houseModulesData from '../assets/data/house.json';
import numberModulesData from '../assets/data/number.json';

import categoriesData from '../assets/data/categories.json'; // New category list data
// Assuming the user has a local dictionary JSON file at this path:
import localDictionaryData from '../assets/data/dictionary.json'; 

// Placeholder URLs for the hosted JSON files.
// Base URL for the new modular module structure
const BASE_URL = 'https://raw.githubusercontent.com/SISLEP/sisl-app/refs/heads/main/src/assets/data/';
const MODULES_BASE_URL = BASE_URL;
const DICTIONARY_DATA_URL = BASE_URL + 'dictionary.json';
const CATEGORIES_DATA_URL = MODULES_BASE_URL + 'categories.json';

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
    class: classModulesData,
    fruit: fruitModulesData,
    garden: gardenModulesData,
    house: houseModulesData,
    number: numberModulesData,
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
    console.warn(`Network request failed for ${dataName}. Falling back to local data:`, error);
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
 * Fetches all learning modules for a specific category and updates video/image 
 * sources to use local URIs if they are downloaded.
 *
 * @param {string} categoryId The ID of the category (e.g., 'alphabet', 'body').
 * @returns {Promise<LearningModule[]>} A promise that resolves with an array of modules for that category.
 */
const fetchModulesByCategory = async (categoryId: string): Promise<LearningModule[]> => {
    // 1. Fetch modules (network or local fallback)
    const url = `${MODULES_BASE_URL}${categoryId}.json`;
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

    let modules = response[categoryId] || [];
    
    // 2. Check if the category is fully downloaded
    const isDownloaded = await isCategoryFullyDownloaded(categoryId);

    // 3. If downloaded, update video/image URIs
    if (isDownloaded) {
        console.log(`Category '${categoryId}' is fully downloaded. Updating module sources.`);
        
        // Deep clone the modules to ensure the original data structures are not mutated
        const updatedModules: LearningModule[] = JSON.parse(JSON.stringify(modules));

        for (const module of updatedModules) {
            if (module.lessons && Array.isArray(module.lessons)) {
                for (const lesson of module.lessons) {
                    
                    // A. Handle lessons with signVideo/signImage directly in lesson.data (e.g., 'translation')
                    if (lesson.data.signVideo) {
                        lesson.data.signVideo = await getBestVideoSource(
                            lesson.data.signVideo,
                            categoryId
                        );
                    }
                    if (lesson.data.signImage) {
                        lesson.data.signImage = await getBestVideoSource(
                            lesson.data.signImage,
                            categoryId
                        );
                    }
                    
                    // B. Handle lessons with an 'items' array in lesson.data (e.g., 'matching_pairs')
                    if (lesson.data.items && Array.isArray(lesson.data.items)) {
                        for (const item of lesson.data.items) {
                            if (item.signVideo) {
                                item.signVideo = await getBestVideoSource(
                                    item.signVideo,
                                    categoryId
                                );
                            }
                            if (item.signImage) {
                                item.signImage = await getBestVideoSource(
                                    item.signImage,
                                    categoryId
                                );
                            }
                        }
                    }

                    // C. NEW: Handle lessons with lesson.data as an array (e.g., 'conversation')
                    if (Array.isArray(lesson.data)) {
                        for (const conversationItem of lesson.data) {
                            if (conversationItem.signVideo) {
                                conversationItem.signVideo = await getBestVideoSource(
                                    conversationItem.signVideo,
                                    categoryId
                                );
                            }
                            if (conversationItem.signImage) {
                                conversationItem.signImage = await getBestVideoSource(
                                    conversationItem.signImage,
                                    categoryId
                                );
                            }
                        }
                    }
                }
            }
        }
        
        // Return the modules with updated local paths
        return updatedModules;
    }

    // 4. Return original modules if not downloaded or if an error occurred during update
    return modules;
};


/**
 * Fetches dictionary data, using local data as a fallback.
 * The network request expects the shape of DictionaryData (categories as keys).
 * This function also updates signVideo and signImage URLs to local URIs 
 * if the corresponding category is fully downloaded.
 *
 * @returns {Promise<DictionaryData>} A promise that resolves with the dictionary data object.
 */
const fetchDictionaryData = async (): Promise<DictionaryData> => {
  // 1. Fetch the raw dictionary data (network or local fallback)
  const dictionaryData = await fetchData<DictionaryData>(
    DICTIONARY_DATA_URL,
    localDictionaryData as DictionaryData,
    'dictionary'
  );

  // 2. Create a deep copy to modify the URIs
  const updatedDictionaryData: DictionaryData = JSON.parse(JSON.stringify(dictionaryData));

  // 3. Iterate over categories and update word sources
  for (const categoryKey in updatedDictionaryData) {
    if (updatedDictionaryData.hasOwnProperty(categoryKey)) {
        
        // Convert the category key to the expected lowercase ID for the file system functions
        const categoryId = categoryKey.toLowerCase();
        
        // Check if the category is fully downloaded
        const isDownloaded = await isCategoryFullyDownloaded(categoryId);
        
        if (isDownloaded) {
            console.log(`Category '${categoryKey}' is fully downloaded. Updating word sources.`);
            
            const words = updatedDictionaryData[categoryKey];
            
            for (const word of words) {
                // Update signVideo source
                if (word.signVideo) {
                    word.signVideo = await getBestVideoSource(
                        word.signVideo,
                        categoryId
                    );
                }

                // Update signImage source (if it exists)
                if (word.signImage) {
                    word.signImage = await getBestVideoSource(
                        word.signImage,
                        categoryId
                    );
                }
            }
        }
    }
  }

  return updatedDictionaryData;
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
 * @returns A promise that resolves to the local URI (if found) or the original remote URL.
 */
const getBestVideoSource = async (
    remoteUrl: string, 
    categoryId: string
): Promise<string> => {
    // 1. Calculate the expected local URI.
    const localUri = getLocalVideoUri(remoteUrl, categoryId);

    // 2. Check the file system to see if the file exists locally.
    const fileExists = await isFileDownloaded(remoteUrl, categoryId);

    if (fileExists) {
        console.log(`Using local file for ${remoteUrl}: ${localUri}`);
        // 3. If it exists, return the local URI.
        return localUri;
    }
    
    // 4. Fallback to the original remote URL.
    console.log(`Using remote URL for ${remoteUrl}`);
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
    // --- Remove existing files before starting the download ---
    await removeCategoryVideos(categoryId);

    await ensureCategoryDirectoryExists(categoryId);
    const urls = getCategoryVideoUrls(categoryId);
    const dir = getCategoryDirectory(categoryId);
    
    console.log(`Starting download for ${urls.length} files in category ${categoryId}`);

    const downloadPromises = urls.map(url => {
        // Extract the filename from the URL (e.g., "https://.../Alphabet/A.mp4" -> "A.mp4")
        const filename = url.substring(url.lastIndexOf('/') + 1);
        
        // Use downloadAsync for downloading the file
        return File.downloadFileAsync(encodeURI(url), dir)
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
    getLocalVideoUri,
    isFileDownloaded,
    getBestVideoSource,
};