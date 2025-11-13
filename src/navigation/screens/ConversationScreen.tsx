import React, { useState, useCallback, useRef, memo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
} from 'react-native';
// REMOVED SafeAreaView import for the bottom navigation, but keeping import for consistency
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Video from 'react-native-video';
// Using Material Icons
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const { width } = Dimensions.get('window');
// Full width minus padding
const VIDEO_WIDTH = width - 40; 

/**
 * ConversationScreen component for displaying sequential video dialogue.
 * All previous turns remain visible, and the screen scrolls to the current turn.
 * @param {object[]} data - Array of conversation turns.
 * @param {function} onNext - Function to call when the entire conversation is complete.
 */
const ConversationScreen = ({ data, onNext }) => {
  const scrollViewRef = useRef(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isCaptionsOn, setIsCaptionsOn] = useState(true);
  // A dictionary to track if a specific video has finished playing for replay logic on past turns
  const [videoFinishedStatus, setVideoFinishedStatus] = useState({});
  
  // REPLACED isPlaying and pastVideoPlayingIndex with a single state
  // Tracks the index of the video that is currently playing. -1 means none.
  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(0); 

  // Determine the current turn based on the index state
  const currentTurn = data[currentTurnIndex];
  const isLastTurn = currentTurnIndex === data.length - 1;

  // Handler for when ANY video segment finishes playing
  const handleVideoEnd = useCallback(() => {
    // Check if the video that finished was the main CURRENT turn video
    if (currentlyPlayingIndex === currentTurnIndex) {
        setVideoFinishedStatus(prev => ({ 
          ...prev, 
          [currentTurnIndex]: true 
        }));
    }
    // Always pause all playback (both current and past) after a video finishes
    setCurrentlyPlayingIndex(-1); 
  }, [currentTurnIndex, currentlyPlayingIndex]);

  // Handler to replay the current video segment
  const handleReplay = useCallback(() => {
    // Only allow replay if the current video is finished
    if (videoFinishedStatus[currentTurnIndex] || currentlyPlayingIndex === -1) {
      setVideoFinishedStatus(prev => ({ 
        ...prev, 
        [currentTurnIndex]: false 
      }));
      // Start playing the current video
      setCurrentlyPlayingIndex(currentTurnIndex);
    }
  }, [currentTurnIndex, videoFinishedStatus, currentlyPlayingIndex]);
  
  // Handler to replay a PAST video segment
  const handlePastReplay = useCallback((index) => {
    // Start playing the selected past video
    setCurrentlyPlayingIndex(index);
  }, []);


  // Handler to move to the next conversation turn or finish the lesson
  const handleNext = () => {
    if (currentTurnIndex < data.length - 1) {
      const nextIndex = currentTurnIndex + 1;
      setCurrentTurnIndex(nextIndex);
      // Start playing the new turn's video immediately
      setCurrentlyPlayingIndex(nextIndex);
      
      // Scroll to the bottom to view the new turn
      if (scrollViewRef.current) {
        // Delay scroll slightly to allow the new video card to render fully
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    } else {
      // Lesson finished, call parent's onNext
      onNext(); 
    }
  };

  // No reload on caption toggle
  const toggleCaptions = () => {
    setIsCaptionsOn(prev => !prev);
  };
  
  /**
   * Component to render the video and associated captions/controls.
   * Wrapped in memo to prevent unnecessary re-render/reload of the Video component
   * when only non-video-related props (like isCaptionsOn) change.
   */
  const VideoCard = memo(({ turn, index, isCurrent, isFinished, shouldBePaused, isCaptionsOn, onReplay, onPastReplay }) => {
    // In a real app, you would dynamically load the appropriate video for the turn.
    const videoSource = { uri: turn.signVideo }; 
    const isPerson2 = turn.speaker === 'person2';
    
    return (
      // 1. Alignment container (flex-start/flex-end)
      <View style={[isPerson2 ? styles.alignRight : styles.alignLeft]}>
        {/* 2. Video Card Wrapper with background color */}
        <View style={[styles.videoCardWrapper, { backgroundColor: turn.backgroundColor }]}>
          
          <View style={[styles.videoCard]}>
            {/* Video Player */}
            <Video
              source={videoSource}
              style={styles.videoPlayer}
              // Video is paused if 'shouldBePaused' is true.
              paused={shouldBePaused}
              repeat={false} 
              resizeMode="contain"
              // Only attach onEnd handler if the video is NOT paused
              onEnd={!shouldBePaused ? handleVideoEnd : undefined}
              poster="https://placehold.co/400x260/E0E0E0/333?text=Sign+Video+Turn"
              posterResizeMode="cover"
            />
            
            {/* Replay Icon (Visible when turn is finished) 
                Also hide the replay button if the video is currently playing.
            */}
            {isFinished && shouldBePaused && ( 
              <TouchableOpacity 
                style={styles.replayButton} 
                // Pass the index for past replays
                onPress={isCurrent ? onReplay : () => onPastReplay(index)}
              >
                <Icon name="replay" size={24} color="#7C7C7C" /> 
              </TouchableOpacity>
            )}
          </View>
          
          {/* Caption Display (Visible only when turn is finished and captions are ON) */}
          {isFinished && isCaptionsOn && (
            <View style={[
              styles.captionBubbleContainer,
              // Mimic speech bubble alignment based on speaker/turn
              isPerson2 ? styles.captionRight : styles.captionLeft
            ]}>
              {/* Line 1: Sign Meaning */}
              <View style={[
                styles.signBubble, 
                // APPLY DYNAMIC BACKGROUND COLOR HERE
                isPerson2 ? styles.signBubbleRight : styles.signBubbleLeft,
                isPerson2 ? styles.signBubblePerson2 : styles.signBubblePerson1
              ]}>
                <Text style={styles.signText}>{turn.signSentence}</Text>
              </View>
              {/* Line 2: Proper English Sentence */}
              <Text style={styles.englishText}>{turn.englishSentence}</Text>
            </View>
          )}
        </View>
      </View>
    );
  });
  // Must set a display name for components wrapped in React.memo
  VideoCard.displayName = 'VideoCard';

  // Determine if the current video is finished based on the new state
  // The current video is finished if the global playing index is -1 AND
  // its video finished status is true OR a past video is playing.
  const isCurrentVideoFinished = videoFinishedStatus[currentTurnIndex] || currentlyPlayingIndex < currentTurnIndex;

  if (!currentTurn) return <Text style={styles.errorText}>Lesson data is missing.</Text>;

  const renderBottomNav = () => (
    // MODIFIED: Reverting to a standard View container for consistent fixed positioning
    <View style={styles.bottomNavContainer}> 
      <View style={styles.bottomNavContent}>
        
        {/* Captions Button (Removed Speed Button) */}
        <TouchableOpacity style={styles.navButton} onPress={toggleCaptions}>
          {/* Mimic the orange 'ON' button from the screenshot */}
          <View style={[styles.captionIcon, isCaptionsOn ? styles.captionIconOn : styles.captionIconOff]}>
            <Text style={styles.captionIconText}>{isCaptionsOn ? 'ON' : 'OFF'}</Text>
          </View>
          <Text style={styles.navText}>Captions</Text>
        </TouchableOpacity>
        
        {/* Spacer to push Next button to the right */}
        <View style={{ flex: 1 }} />
        
        {/* Next Button - Enabled only when video is finished (i.e., currentlyPlayingIndex is not currentTurnIndex) */}
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            { backgroundColor: currentlyPlayingIndex !== currentTurnIndex ? '#58CC02' : '#E6E8EA' } // Green when enabled, light gray when disabled
          ]} 
          onPress={handleNext}
          disabled={currentlyPlayingIndex === currentTurnIndex} 
        >
          <Text style={[styles.nextText, { color: currentlyPlayingIndex !== currentTurnIndex ? '#fff' : '#A9A9A9' }]}>
            {isLastTurn ? 'Finish Lesson' : 'Next'}
          </Text>
          <Icon name="arrow-forward" size={20} color={currentlyPlayingIndex !== currentTurnIndex ? '#fff' : '#A9A9A9'} />
        </TouchableOpacity>
      </View>
      {/* Re-introducing SafeAreaView padding only if necessary, but outside the fixed position container for safety, 
          or by using a separate bottom padding view if necessary. 
          For now, rely on increased paddingBottom in the ScrollView. */}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerTitle}>Conversation Practice</Text>
        
        {/* Iterate over all turns up to the current index */}
        {data.slice(0, currentTurnIndex + 1).map((turn, index) => {
          const isCurrent = index === currentTurnIndex;
          const isPast = index < currentTurnIndex;
          
          // Paused Logic: The video is paused if its index is NOT the currently playing index.
          const shouldBePaused = index !== currentlyPlayingIndex;
          
          return (
            <VideoCard
              key={index} // Stable key for the outer component
              turn={turn}
              index={index}
              isCurrent={isCurrent}
              // A turn is finished if it's in the past OR the current video has finished its first playback loop
              isFinished={isPast || isCurrentVideoFinished} 
              // Pass the new computed paused status
              shouldBePaused={shouldBePaused} 
              isCaptionsOn={isCaptionsOn}
              onReplay={handleReplay}
              // Pass the implemented handler
              onPastReplay={handlePastReplay}
            />
          );
        })}

        {/* Anchor point to ensure scroll goes to the bottom of the last item */}
        <View style={{ height: 1 }} onLayout={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }} />

      </ScrollView>
      {renderBottomNav()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    // FIXED: Increased paddingBottom back to 100, which is typically enough to clear a bottom bar + safe area on iOS/Android.
    paddingBottom: 100, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'flex-start',
    color: '#333',
  },
  errorText: {
    padding: 20,
    textAlign: 'center',
    color: 'red',
  },
  
  // --- Alignment Styles for Cards ---
  alignLeft: {
    alignSelf: 'flex-start',
    width: '100%', // Take full width to allow internal card alignment if needed
  },
  alignRight: {
    alignSelf: 'flex-end',
    width: '100%',
    alignItems: 'flex-end', // Align the card wrapper itself to the right
  },

  // --- Video Card Styles ---
  videoCardWrapper: {
    width: '90%', // Reduce width slightly for better chat bubble appearance
    maxWidth: 500, 
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Background color is now applied here
  },
  videoCard: {
    width: '100%',
    aspectRatio: 1.5, 
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent', // Make inner video card transparent
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  replayButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
    zIndex: 10,
  },

  // --- Caption Styles (Post-video) ---
  captionBubbleContainer: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  captionLeft: {
    alignItems: 'flex-start',
  },
  captionRight: {
    alignItems: 'flex-end',
  },
  // Speech bubble style for Sign Meaning
  signBubble: {
    // REMOVED fixed background color from here
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 5,
    maxWidth: '100%',
  },
  signBubbleLeft: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4, 
  },
  signBubbleRight: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4, 
  },
  // NEW STYLES: Different background colors based on speaker
  signBubblePerson1: {
    backgroundColor: '#B2EBF2', // Original/Default color for person1
  },
  signBubblePerson2: {
    backgroundColor: '#D1C4E9', // A new color (e.g., light purple) for person2
  },
  signText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005A5A',
  },
  englishText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },

  // --- Bottom Navigation Styles ---
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    // Add vertical padding/height control here to estimate required ScrollView padding.
  },
  bottomNavContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingTop: 10, 
    paddingBottom: 30,
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    color: '#555',
  },
  
  // Captions Button Custom Styling
  captionIcon: {
    width: 48, 
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionIconOn: {
    borderColor: '#FFC800', 
    backgroundColor: '#FFFBEA', 
  },
  captionIconOff: {
    borderColor: '#A9A9A9',
    backgroundColor: '#F0F0F0',
  },
  captionIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
  },

  // Next Button Styling
  nextButton: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 25,
    marginLeft: 'auto', // Pushes button to the far right
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ConversationScreen;