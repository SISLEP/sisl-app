// storage/progressService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROGRESS_STORAGE_KEY = 'userProgress';

// Define the shape of the progress object for clarity
export type UserProgress = { 
  [uniqueModuleKey: string]: { 
    lessonsCompleted: number 
  } 
};

/**
 * Loads the user progress object from AsyncStorage.
 * Returns an empty object if no progress is found or an error occurs.
 */
export const loadUserProgress = async (): Promise<UserProgress> => {
  try {
    const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (storedProgress) {
      return JSON.parse(storedProgress) as UserProgress;
    }
    return {};
  } catch (e) {
    console.error('Failed to load progress from storage', e);
    return {};
  }
};

/**
 * Saves the entire user progress object to AsyncStorage.
 */
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to storage', e);
  }
};

/**
 * Updates progress for a single module.
 * It loads the current progress, updates the specific module's entry, and saves it back.
 * NOTE: For this architecture, we will update the state in the context provider, 
 * and let the provider handle the persistence using `saveUserProgress`.
 * We'll keep this helper here in case it's needed elsewhere.
 */
// export const updateModuleProgress = async (uniqueModuleKey: string, lessonsCompleted: number): Promise<UserProgress> => {
//   const currentProgress = await loadUserProgress();
//   const newProgress = {
//     ...currentProgress,
//     [uniqueModuleKey]: { lessonsCompleted },
//   };
//   await saveUserProgress(newProgress);
//   return newProgress;
// };