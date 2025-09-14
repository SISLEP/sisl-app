/**
 * @fileoverview This file contains the API service for fetching learning modules with a local fallback.
 */

// Import the local JSON data to use as a fallback.
import learningModulesData from '../assets/data/learningModules.json';

// Placeholder URL for the hosted JSON file.
// const DATA_URL = 'https://myystique16.github.io/video-site/learningModules.json';

/**
 * Interface representing a single learning module.
 */
interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
}

/**
 * Interface for the fetched data structure.
 */
interface LearningModulesResponse {
  learningModules: LearningModule[];
}

/**
 * Fetches learning modules from an online hosted file.
 * If the network request fails, it falls back to a local JSON file.
 *
 * @returns {Promise<LearningModule[]>} A promise that resolves with an array of learning modules.
 */
const fetchLearningModules = async (): Promise<LearningModule[]> => {
  // Use AbortController for request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const response = await fetch(DATA_URL, { signal: controller.signal });

    if (!response.ok) {
      // If the response is not ok (e.g., 404, 500), throw an error to trigger the catch block.
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: LearningModulesResponse = await response.json();
    console.log('Successfully fetched modules from network.');
    return data.learningModules;
  } catch (error) {
    console.error('Network request failed, falling back to local data:', error);
    // On failure, return the data from the locally imported JSON file.
    return learningModulesData.learningModules;
  } finally {
    clearTimeout(timeoutId); // Clean up the timeout regardless of success or failure
  }
};

export { fetchLearningModules };
