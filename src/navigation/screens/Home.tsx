import { useNavigation } from '@react-navigation/native'; // Import the hook
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchLearningModules } from '../../api/fetch';

const Home = () => {
  const navigation = useNavigation();
  const [learningModules, setLearningModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const modules = await fetchLearningModules();
        setLearningModules(modules);
      } catch (error) {
        Alert.alert('Error', 'Failed to load learning modules. Please check your network connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModules();
  }, []);

  const handleContinue = () => {
    // Navigate to the first lesson of the last active module
    console.log('Continue lesson pressed');
  };

  const handleModulePress = (moduleId) => {
    const selectedModule = learningModules.find(mod => mod.id === moduleId);
    if (selectedModule && selectedModule.lessons.length > 0) {
      // Navigate to the first lesson of the selected module
      navigation.navigate('LessonScreen', { lessons: selectedModule.lessons });
      // navigation.navigate('Profile', { user: 'jane' });
    } else {
      Alert.alert('No lessons', 'This module has no lessons yet.');
    }
  };

  const renderLearningModule = (module) => (
    <TouchableOpacity
      key={module.id}
      style={[styles.moduleCard, { backgroundColor: module.bgColor }]}
      onPress={() => handleModulePress(module.id)}
    >
      <View style={styles.moduleIcon}>
        <Text style={styles.moduleEmoji}>{module.icon}</Text>
      </View>
      <View style={styles.moduleContent}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back-ios" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>Welcome!</Text>
              <Text style={styles.welcomeSubtitle}>Continue lesson</Text>
              <Text style={styles.welcomeDescription}>Let's learn new signs!</Text>
            </View>
            <View style={styles.mascotContainer}>
              <Text style={styles.mascot}>🤖</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Learning Modules */}
        <View style={styles.modulesSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF9500" />
          ) : (
            learningModules.map(renderLearningModule)
          )}
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator}>
          <View style={styles.indicatorLine} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  battery: {
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 2,
    marginLeft: 4,
    position: 'relative',
  },
  batteryFill: {
    position: 'absolute',
    left: 1,
    top: 1,
    bottom: 1,
    width: '80%',
    backgroundColor: '#000',
    borderRadius: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
  },
  mascotContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    fontSize: 32,
  },
  continueButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modulesSection: {
    gap: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleEmoji: {
    fontSize: 20,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  moduleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  bottomIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicatorLine: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
});

export default Home;