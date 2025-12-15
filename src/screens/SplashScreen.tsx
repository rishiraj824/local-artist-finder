import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const GENRES = [
  { name: 'TECHNO', color: '#39ff14' },
  { name: 'HOUSE', color: '#ff006e' },
  { name: 'D&B', color: '#00f0ff' },
  { name: 'DUBSTEP', color: '#d4622f' },
  { name: 'TRANCE', color: '#e8d174' },
  { name: 'AMBIENT', color: '#bb86fc' },
];

interface FloatingCardProps {
  genre: { name: string; color: string };
  delay: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ genre, delay, startX, startY, endX, endY }) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(Math.random() * 360);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Fade in and scale up
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    // Float across screen
    translateX.value = withDelay(
      delay,
      withTiming(endX, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.quad) })
    );

    translateY.value = withDelay(
      delay,
      withTiming(endY, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.quad) })
    );

    // Continuous rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotate.value + 360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.genreCard,
        {
          backgroundColor: genre.color,
          shadowColor: genre.color,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.genreText}>{genre.name}</Text>
    </Animated.View>
  );
};

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000); // Show splash for 4 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Generate random start and end positions for each card
  const generatePositions = () => {
    return GENRES.map(() => {
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startX = 0, startY = 0, endX = 0, endY = 0;

      // Random start position from edge
      switch (side) {
        case 0: // from top
          startX = Math.random() * width;
          startY = -100;
          break;
        case 1: // from right
          startX = width + 100;
          startY = Math.random() * height;
          break;
        case 2: // from bottom
          startX = Math.random() * width;
          startY = height + 100;
          break;
        case 3: // from left
          startX = -100;
          startY = Math.random() * height;
          break;
      }

      // Random end position towards center or opposite side
      const centerX = width / 2;
      const centerY = height / 2;
      endX = centerX + (Math.random() - 0.5) * width * 0.8;
      endY = centerY + (Math.random() - 0.5) * height * 0.8;

      return { startX, startY, endX, endY };
    });
  };

  const positions = generatePositions();

  return (
    <View style={styles.container}>
      {/* Background with noise texture */}
      <View style={styles.background}>
        {GENRES.map((genre, index) => (
          <FloatingCard
            key={index}
            genre={genre}
            delay={index * 200}
            startX={positions[index].startX}
            startY={positions[index].startY}
            endX={positions[index].endX}
            endY={positions[index].endY}
          />
        ))}
      </View>

      {/* Main Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>drops</Text>
        <View style={styles.underline} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  genreCard: {
    position: 'absolute',
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  genreText: {
    fontFamily: 'BlackOpsOne_400Regular',
    fontSize: 14,
    color: '#000',
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  titleContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  mainTitle: {
    fontFamily: 'BlackOpsOne_400Regular',
    fontSize: 48,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#39ff14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  underline: {
    width: 200,
    height: 4,
    backgroundColor: '#39ff14',
    marginTop: 16,
    shadowColor: '#39ff14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
});
