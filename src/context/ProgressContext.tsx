// context/ProgressContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadUserProgress, saveUserProgress, UserProgress } from '../storage/progressService';

// Define the shape of the Context value
interface ProgressContextType {
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  // Optional: A function to specifically update progress by module key
  updateModuleProgress: (moduleId: string, lessonsCompleted: number) => void;
  isLoadingProgress: boolean; // To track initial load state
}

// Create the Context
// Provide a default value that matches the shape (or null and check)
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Define the Provider component
interface ProgressProviderProps {
  children: React.ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // 1. Initial Load from Storage
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await loadUserProgress();
      setUserProgress(progress);
      setIsLoadingProgress(false);
    };
    loadProgress();
  }, []);

  // 2. Persist to Storage whenever userProgress changes
  useEffect(() => {
    // Avoid saving on initial load when the state is set from storage
    if (!isLoadingProgress) { 
      saveUserProgress(userProgress);
    }
  }, [userProgress, isLoadingProgress]);


  // Helper function to update a single module's progress
  const updateModuleProgress = (moduleId: string, lessonsCompleted: number) => {
    setUserProgress(prevProgress => {
      // Logic to determine if progress has truly changed can be added here
      return {
        ...prevProgress,
        [moduleId]: { lessonsCompleted },
      };
    });
    // The useEffect hook above will handle the AsyncStorage persistence
  };


  const contextValue: ProgressContextType = {
    userProgress,
    setUserProgress,
    updateModuleProgress,
    isLoadingProgress,
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook for easy consumption
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};