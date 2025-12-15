import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useSpotifyApi } from "../hooks/useSpotifyApi";
import { useAuth } from "../context/AuthContext";
import React, { useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import { useNavigation } from '@react-navigation/native';

interface Genre {
  name: string;
  color: string;
}

interface GenreGridProps {
  genres: Genre[];
}

interface GenrePosition {
  x: number;
  y: number;
}

interface SunburstSegment {
  name: string;
  color: string;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  popularity: number;
  category?: string;
}

// Genre hierarchy for sunburst chart (from EDM Sub-genres diagram)
const GENRE_CATEGORIES: Record<string, string[]> = {
  'Breakbeat': ['acid-breaks', 'big-beat', 'electro-funk', 'electro', 'miami-bass', 'progressive-breaks', 'nu-electro', 'freestyle', 'nu-funk', 'breakbeat', 'breaks'],
  'Trance': ['acid-trance', 'dark-trance', 'trance', 'progressive-trance', 'psychedelic-trance', 'euro-trance', 'hard-trance', 'minimal-trance', 'happy-hardcore', 'goa-trance', 'eurotrance'],
  'House': ['disco', 'nu-disco', 'house', 'big-room', 'technodance', 'minimal-house', 'eurodance', 'electro-house', 'tech-house', 'tribal-house', 'progressive-house', 'deep-house', 'chicago-house'],
  'Jungle': ['hardcore-jungle', 'darkcore-jungle', 'raggacore', 'ragga-jungle', 'jungle'],
  'Techno': ['electro-techno', 'tech-house', 'techno-dance', 'deep-house', 'minimal-techno', 'experimental', 'acid-techno', 'hard-techno', 'techno', 'detroit-techno', 'industrial-techno'],
  'Hardcore': ['happy-hardcore', 'hardcore', 'trancecore', 'speedcore', 'noizecore', 'metalcore', 'uk-hardcore', '4-beat', 'nu-skool-breaks', 'big-beat', 'gabber', 'terrorcore', 'frenchcore'],
  'Drum and Bass': ['grime', 'techstep', 'liquid-jungle', 'liquid-funk', 'darkstep', 'drumstep', 'hardstep', 'breakcore', 'chillstep', 'drum-and-bass', 'dnb', 'neurofunk', 'jump-up'],
  'Dub': ['afrodub', 'ambient-dub', 'dubtronica', 'trip-hop', 'darkhall', 'dubstep', 'brostep', 'dub-techno'],
  'Downtempo': ['acid-jazz', 'chillout', 'nu-jazz', 'ambient', 'synthpop', 'trip-hop', 'dark-ambient', 'minimalism', 'downtempo', 'lo-fi', 'chillwave'],
  'UK Garage': ['breakstep', 'future-garage', 'garage', 'uk-garage', 'grime', 'chillstep', 'speed-garage', '2-step', 'bassline', 'uk-funky']
};

// BPM ranges for electronic music genres (average BPM)
const GENRE_BPM_MAP: Record<string, number> = {
  // Very Slow (60-90 BPM)
  ambient: 70,
  "dark-ambient": 70,
  "ambient-dub": 75,
  downtempo: 80,
  chillout: 85,
  "trip-hop": 90,
  "lo-fi": 85,
  psybient: 90,

  // Slow (90-110 BPM)
  chillwave: 95,
  vaporwave: 100,
  darkwave: 100,
  synthwave: 105,
  synthpop: 110,
  retrowave: 105,
  outrun: 110,

  // Medium-Slow (110-120 BPM)
  disco: 115,
  "nu-disco": 115,
  "italo-disco": 120,
  electro: 115,
  electroclash: 120,
  "electro-funk": 110,
  "miami-bass": 115,

  // House (120-128 BPM)
  house: 125,
  "deep-house": 122,
  "tech-house": 125,
  "progressive-house": 126,
  "electro-house": 128,
  "future-house": 128,
  "tropical-house": 120,
  "bass-house": 128,
  "chicago-house": 122,
  "acid-house": 125,
  "big-room": 128,
  "melbourne-bounce": 128,

  // Techno (125-135 BPM)
  techno: 130,
  "minimal-techno": 128,
  "detroit-techno": 130,
  "acid-techno": 135,
  "hard-techno": 140,
  "industrial-techno": 135,
  "dub-techno": 125,

  // Trance (130-140 BPM)
  trance: 138,
  "progressive-trance": 132,
  psytrance: 145,
  "uplifting-trance": 138,
  "vocal-trance": 136,
  "tech-trance": 135,
  "goa-trance": 145,
  "psychedelic-trance": 145,

  // UK Genres (130-140 BPM)
  "uk-garage": 130,
  "speed-garage": 135,
  garage: 130,
  "2-step": 135,
  bassline: 140,
  "uk-funky": 130,
  grime: 140,

  // Breaks (130-145 BPM)
  breakbeat: 135,
  breaks: 135,
  "nu-skool-breaks": 140,
  "progressive-breaks": 135,
  "florida-breaks": 140,
  "acid-breaks": 138,

  // Dubstep/Bass (135-145 BPM)
  dubstep: 140,
  brostep: 140,
  riddim: 140,
  "uk-dubstep": 140,
  drumstep: 170,
  trap: 140,
  "future-bass": 140,
  bass: 140,
  "glitch-hop": 110,
  moombahton: 108,

  // Fast (145-165 BPM)
  jungle: 160,
  "drum-and-bass": 170,
  dnb: 170,
  "liquid-funk": 174,
  neurofunk: 174,
  "jump-up": 174,
  footwork: 160,
  juke: 160,

  // Very Fast (165-180 BPM)
  hardstyle: 150,
  rawstyle: 155,
  hardcore: 170,
  gabber: 180,
  "happy-hardcore": 170,
  "uk-hardcore": 170,
  "hands-up": 140,
  eurodance: 140,

  // Extremely Fast (180+ BPM)
  speedcore: 200,
  terrorcore: 220,
  frenchcore: 200,

  // Other/Variable
  edm: 128,
  electronica: 120,
  dance: 125,
  rave: 140,
  club: 125,
  idm: 120,
  glitch: 110,
  experimental: 120,
  microhouse: 125,
  "clicks-and-cuts": 120,
  industrial: 130,
  ebm: 130,
  aggrotech: 140,
  "dark-electro": 135,
  "power-noise": 140,
  dancehall: 90,
  vogue: 130,
  ballroom: 130,
  "jersey-club": 140,
  phonk: 140,
  "drift-phonk": 160,
  wave: 140,
  hardwave: 150,
};

// Get BPM for a genre, return default if not found
const getGenreBPM = (genreName: string): number => {
  return GENRE_BPM_MAP[genreName.toLowerCase()] || 128; // Default to 128 BPM
};

// Temporary popularity scores (1-10 scale) for genre sizing
const GENRE_POPULARITY_MAP: Record<string, number> = {
  // Very Popular (8-10)
  house: 10,
  techno: 10,
  trance: 9,
  dubstep: 9,
  "drum-and-bass": 8,
  dnb: 8,
  edm: 10,
  "electro-house": 9,
  "progressive-house": 8,
  "deep-house": 8,
  trap: 9,

  // Popular (6-8)
  "tech-house": 7,
  "bass-house": 7,
  disco: 7,
  "nu-disco": 6,
  synthwave: 7,
  "future-bass": 7,
  hardstyle: 7,
  jungle: 6,
  breakbeat: 6,

  // Moderately Popular (4-6)
  ambient: 5,
  downtempo: 5,
  chillout: 5,
  "trip-hop": 4,
  garage: 5,
  "uk-garage": 5,
  grime: 6,
  psytrance: 5,
  "acid-house": 5,

  // Niche/Underground (2-4)
  gabber: 3,
  speedcore: 2,
  terrorcore: 2,
  microhouse: 3,
  "minimal-techno": 4,
  "dark-ambient": 3,
  idm: 4,
  glitch: 3,
  experimental: 3,

  // Other
  electronica: 6,
  dance: 8,
  rave: 6,
  club: 7,
};

// Get popularity for a genre, return default if not found
const getGenrePopularity = (genreName: string): number => {
  return GENRE_POPULARITY_MAP[genreName.toLowerCase()] || 5; // Default to 5 (medium)
};

// Genre aliases - map alternative names to canonical names
const GENRE_ALIASES: Record<string, string> = {
  'dnb': 'drum-and-bass',
  'd&b': 'drum-and-bass',
  'drum & bass': 'drum-and-bass',
  'drum and bass': 'drum-and-bass',
  'breaks': 'breakbeat',
  'uk garage': 'uk-garage',
  'garage': 'uk-garage',
  '2 step': '2-step',
  'psytrance': 'psychedelic-trance',
  'goa': 'goa-trance',
};

// Normalize genre name to its canonical form
const normalizeGenreName = (genreName: string): string => {
  const lower = genreName.toLowerCase();
  return GENRE_ALIASES[lower] || lower;
};

// Create SVG arc path
const createArcPath = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const x1 = centerX + innerRadius * Math.cos(startAngle);
  const y1 = centerY + innerRadius * Math.sin(startAngle);
  const x2 = centerX + outerRadius * Math.cos(startAngle);
  const y2 = centerY + outerRadius * Math.sin(startAngle);
  const x3 = centerX + outerRadius * Math.cos(endAngle);
  const y3 = centerY + outerRadius * Math.sin(endAngle);
  const x4 = centerX + innerRadius * Math.cos(endAngle);
  const y4 = centerY + innerRadius * Math.sin(endAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
    'Z',
  ].join(' ');
};

// Generate position on a specific concentric circle
const getPositionOnCircle = (radius: number, angle: number): GenrePosition => {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
};

// Create sunburst chart segments from genres
const createSunburstSegments = (
  genres: Genre[],
  centerRadius: number,
  maxRadius: number
): SunburstSegment[] => {
  const segments: SunburstSegment[] = [];

  // Deduplicate genres by name (case-insensitive) and handle aliases
  const uniqueGenres: Genre[] = [];
  const seenGenreNames = new Set<string>();
  genres.forEach(genre => {
    const normalizedName = normalizeGenreName(genre.name);
    if (!seenGenreNames.has(normalizedName)) {
      seenGenreNames.add(normalizedName);
      // Use the normalized name for the genre
      uniqueGenres.push({
        ...genre,
        name: normalizedName
      });
    }
  });

  // Calculate total popularity for each category
  const categoryPopularity: Record<string, number> = {};
  const categoryGenres: Record<string, Genre[]> = {};
  const assignedGenres = new Set<string>(); // Track which genres have been assigned to a category

  Object.keys(GENRE_CATEGORIES).forEach(category => {
    const genresInCategory = uniqueGenres.filter(g => {
      const lowerName = g.name.toLowerCase();
      // Only include if not already assigned and matches this category
      return !assignedGenres.has(lowerName) &&
             GENRE_CATEGORIES[category].includes(lowerName);
    });

    // Mark these genres as assigned
    genresInCategory.forEach(g => assignedGenres.add(g.name.toLowerCase()));

    categoryGenres[category] = genresInCategory;
    categoryPopularity[category] = genresInCategory.reduce((sum, g) =>
      sum + getGenrePopularity(g.name), 0
    );
  });

  const totalPopularity = Object.values(categoryPopularity).reduce((a, b) => a + b, 0);

  // Inner ring: Categories
  let currentAngle = -Math.PI / 2; // Start from top
  const innerRadius = centerRadius;
  const categoryRingRadius = centerRadius + (maxRadius - centerRadius) * 0.4;

  Object.keys(GENRE_CATEGORIES).forEach(category => {
    if (categoryGenres[category].length === 0) return;

    const categoryPop = categoryPopularity[category];
    const angleSpan = (categoryPop / totalPopularity) * 2 * Math.PI;

    // Add category segment
    segments.push({
      name: category,
      color: categoryGenres[category][0]?.color || '#888',
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
      innerRadius,
      outerRadius: categoryRingRadius,
      popularity: categoryPop,
      category: category
    });

    // Outer ring: Individual genres within category
    let genreAngle = currentAngle;
    const genreRingInner = categoryRingRadius;
    const genreRingOuter = maxRadius;

    categoryGenres[category].forEach(genre => {
      const genrePop = getGenrePopularity(genre.name);
      const genreAngleSpan = (genrePop / categoryPop) * angleSpan;

      segments.push({
        name: genre.name,
        color: genre.color,
        startAngle: genreAngle,
        endAngle: genreAngle + genreAngleSpan,
        innerRadius: genreRingInner,
        outerRadius: genreRingOuter,
        popularity: genrePop,
        category: category
      });

      genreAngle += genreAngleSpan;
    });

    currentAngle += angleSpan;
  });

  return segments;
};

// Distribute genres across concentric circles based on BPM with smart spacing
const distributeGenresByBPM = (
  genres: Genre[],
  maxRadius: number,
  minRadius: number = 100
): GenrePosition[] => {
  // Sort genres by BPM (slowest to fastest)
  const sortedGenres = [...genres].sort((a, b) => {
    const bpmA = getGenreBPM(a.name);
    const bpmB = getGenreBPM(b.name);
    return bpmA - bpmB;
  });

  const genreCount = sortedGenres.length;
  const positions: GenrePosition[] = new Array(genreCount);

  // Create a map to store original indices
  const indexMap = new Map<string, number>();
  genres.forEach((genre, idx) => {
    indexMap.set(genre.name, idx);
  });

  // Group genres by BPM ranges for better distribution
  const bpmRanges = [
    { min: 0, max: 90, label: 'very-slow' },
    { min: 90, max: 120, label: 'slow' },
    { min: 120, max: 135, label: 'medium' },
    { min: 135, max: 160, label: 'fast' },
    { min: 160, max: 250, label: 'very-fast' },
  ];

  const groupedGenres: { [key: string]: typeof sortedGenres } = {};
  bpmRanges.forEach(range => {
    groupedGenres[range.label] = sortedGenres.filter(g => {
      const bpm = getGenreBPM(g.name);
      return bpm >= range.min && bpm < range.max;
    });
  });

  // Calculate circles based on BPM groups
  const activeGroups = bpmRanges.filter(r => groupedGenres[r.label].length > 0);
  const circleCount = Math.max(5, activeGroups.length);
  const radiusStep = (maxRadius - minRadius) / Math.max(1, circleCount - 1);

  let genreIndex = 0;
  let circleIdx = 0;

  // Distribute each BPM group to circles (slow = inner, fast = outer)
  activeGroups.forEach((group, groupIdx) => {
    const genresInGroup = groupedGenres[group.label];
    if (genresInGroup.length === 0) return;

    // Distribute all genres in this group across one or more circles
    let groupGenreIdx = 0;
    while (groupGenreIdx < genresInGroup.length && genreIndex < genreCount) {
      const radius = minRadius + circleIdx * radiusStep;

      // Fewer genres per circle for outer circles (more space)
      const baseGenresPerCircle = Math.max(6, 10 - Math.floor(circleIdx / 2));
      const remainingInGroup = genresInGroup.length - groupGenreIdx;
      const genresInThisCircle = Math.min(remainingInGroup, baseGenresPerCircle);

      // Add extra spacing based on circle (outer circles need more space for larger cards)
      const spacingMultiplier = 1 + (circleIdx * 0.15);
      const angleStep = (2 * Math.PI) / (genresInThisCircle * spacingMultiplier);

      for (let i = 0; i < genresInThisCircle && genreIndex < genreCount; i++) {
        const angle = i * angleStep * spacingMultiplier - Math.PI / 2 + circleIdx * 0.1;
        const position = getPositionOnCircle(radius, angle);

        const sortedGenre = sortedGenres[genreIndex];
        const originalIndex = indexMap.get(sortedGenre.name);
        if (originalIndex !== undefined) {
          positions[originalIndex] = position;
        }

        genreIndex++;
        groupGenreIdx++;
      }

      circleIdx++;
    }
  });

  return positions;
};

const SunburstSegmentComponent: React.FC<{
  segment: SunburstSegment;
  centerX: number;
  centerY: number;
  isHovered: boolean;
  isLongPressed: boolean;
  isDiscovered: boolean;
  onPress: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}> = ({ segment, centerX, centerY, isHovered, isLongPressed, isDiscovered, onPress, onHoverIn, onHoverOut, onLongPressStart, onLongPressEnd }) => {
  const path = createArcPath(
    centerX,
    centerY,
    segment.innerRadius,
    segment.outerRadius,
    segment.startAngle,
    segment.endAngle
  );

  // Calculate text position
  const midAngle = (segment.startAngle + segment.endAngle) / 2;
  const midRadius = (segment.innerRadius + segment.outerRadius) / 2;
  const textX = centerX + midRadius * Math.cos(midAngle);
  const textY = centerY + midRadius * Math.sin(midAngle);
  const textRotation = (midAngle * 180) / Math.PI;

  // Calculate font size based on arc size
  const angleSpan = segment.endAngle - segment.startAngle;
  const arcLength = midRadius * angleSpan;
  const fontSize = Math.max(8, Math.min(arcLength * 0.2, 14));

  return (
    <G
      onPress={onPress}
      onPressIn={onHoverIn}
      onPressOut={onHoverOut}
      onLongPress={onLongPressStart}
      delayLongPress={500}
    >
      <Path
        d={path}
        fill={segment.color}
        opacity={isLongPressed ? 1 : isHovered ? 0.95 : isDiscovered ? 1 : 0.3}
        stroke={isDiscovered ? "#ffffff" : "none"}
        strokeWidth={isDiscovered ? 1.5 : 0}
      />
      <SvgText
        x={textX}
        y={textY}
        fontSize={fontSize}
        fill="#fff"
        fontWeight="700"
        textAnchor="middle"
        alignmentBaseline="middle"
        rotation={textRotation}
        origin={`${textX}, ${textY}`}
      >
        {segment.category ? segment.name.toLowerCase() : `${segment.name.toLowerCase()} (${getGenreBPM(segment.name)}bpm)`}
      </SvgText>
    </G>
  );
};

const GenreCard: React.FC<{
  genre: Genre;
  position: GenrePosition;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  containerSize: number;
}> = ({ genre, position, isHovered, onHover, onUnhover, containerSize }) => {
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;

  // Calculate radius from center to determine position
  const radius = Math.sqrt(position.x * position.x + position.y * position.y);
  const maxRadius = containerSize / 2 - 30;

  // Get genre popularity to determine size (higher popularity = larger card)
  const popularity = getGenrePopularity(genre.name);

  // Card width varies from 70px to 150px based on popularity (1-10 scale)
  const minWidth = 70;
  const maxWidth = 150;
  const cardWidth = minWidth + ((popularity - 1) / 9) * (maxWidth - minWidth);

  // Card height varies from 60px to 120px based on popularity
  const minHeight = 60;
  const maxHeight = 120;
  const cardHeight = minHeight + ((popularity - 1) / 9) * (maxHeight - minHeight);

  // Calculate rotation to orient card tangent to circle
  const angle = Math.atan2(position.y, position.x);
  const rotationDeg = (angle * 180) / Math.PI + 90;

  const scale = isHovered ? 1.05 : 1;

  return (
    <Link href={`/genre/${genre.name}`} asChild>
      <Pressable
        onPressIn={onHover}
        onPressOut={onUnhover}
        style={{
          position: "absolute",
          left: centerX + position.x - cardWidth / 2,
          top: centerY + position.y - cardHeight / 2,
          width: cardWidth,
          height: cardHeight,
          transform: [
            { rotate: `${rotationDeg}deg` },
            { scale }
          ],
        }}
      >
        <View
          style={[
            styles.genreCard,
            {
              backgroundColor: genre.color,
              shadowOpacity: isHovered ? 0.4 : 0.2,
              shadowRadius: isHovered ? 12 : 8,
            },
          ]}
        >
          <Text
            style={[
              styles.genreCardText,
              { fontSize: Math.max(10, Math.min(cardWidth, cardHeight) * 0.14) }
            ]}
            numberOfLines={2}
          >
            {genre.name.toLowerCase()}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const GenreGrid: React.FC<GenreGridProps> = ({ genres }) => {
  console.log("[GenreGrid] Component rendered with", genres.length, "genres");

  const navigation = useNavigation<any>();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Make circle much larger - 1.5x the screen size to allow overflow
  const containerSize = Math.max(screenWidth, screenHeight) * 1.5;
  const maxRadius = containerSize / 2 - 30;

  const { getRandomTrack } = useSpotifyApi();
  const { playSoundFromCenter, stopSound } = useAudioPlayer();
  const { user } = useAuth();
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [longPressedGenre, setLongPressedGenre] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get user's discovered genres (normalized to lowercase)
  const discoveredGenres = useMemo(() => {
    if (!user?.genresDiscovered) return new Set<string>();
    return new Set(user.genresDiscovered.map(g => g.toLowerCase().trim()));
  }, [user?.genresDiscovered]);

  // Check if a genre is discovered
  const isGenreDiscovered = (genreName: string): boolean => {
    const normalized = normalizeGenreName(genreName);
    return discoveredGenres.has(normalized);
  };

  // Pan gesture state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Zoom/Scale state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Rotation state - continuous clockwise rotation
  const rotation = useSharedValue(0);
  const [isPaused, setIsPaused] = useState(false);

  // Function to start rotation animation
  const startRotation = (fromValue: number = 0) => {
    rotation.value = fromValue;
    rotation.value = withRepeat(
      withTiming(fromValue + 360, {
        duration: 60000, // 60 seconds for one full rotation
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Don't reverse
    );
  };

  // Start continuous clockwise rotation on mount
  React.useEffect(() => {
    startRotation(0);
  }, []);

  // Pause rotation when long press is active or category is expanded
  React.useEffect(() => {
    if (longPressedGenre || expandedCategory) {
      // Pause: cancel animation but keep current value
      cancelAnimation(rotation);
      setIsPaused(true);
    } else if (isPaused) {
      // Resume: restart animation from current rotation value
      const currentRotation = rotation.value;
      startRotation(currentRotation);
      setIsPaused(false);
    }
  }, [longPressedGenre, expandedCategory]);

  // Generate sunburst segments
  const allSunburstSegments = useMemo(() => {
    return createSunburstSegments(genres, 80, maxRadius);
  }, [genres, maxRadius]);

  // Filter segments based on expanded state
  const sunburstSegments = useMemo(() => {
    if (!expandedCategory) {
      // Show only category segments (inner ring)
      return allSunburstSegments.filter(seg => seg.category === seg.name);
    } else {
      // Show expanded category and its sub-genres
      return allSunburstSegments.filter(
        seg => seg.category === expandedCategory
      );
    }
  }, [allSunburstSegments, expandedCategory]);

  // Pan gesture for dragging the circle
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // Optional: add momentum or snap back if dragged too far
    });

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * event.scale, 3));
    })
    .onEnd(() => {
      // Optional: snap back if zoomed too far
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handleLongPressStart = async (genreName: string) => {
    setLongPressedGenre(genreName);
    console.log("[GenreGrid] Long press started on genre:", genreName);

    try {
      const track = await getRandomTrack(genreName);
      if (track && track.preview_url) {
        console.log("[GenreGrid] Playing track from center:", track.name);
        await playSoundFromCenter(track.preview_url, genreName);
      }
    } catch (error) {
      console.error("[GenreGrid] Error playing track:", error);
    }
  };

  const handleLongPressEnd = async () => {
    console.log("[GenreGrid] Long press ended");
    setLongPressedGenre(null);
    await stopSound();
  };

  const handleHover = (genreName: string) => {
    setHoveredGenre(genreName);
  };

  const handleUnhover = () => {
    setHoveredGenre(null);
  };

  if (genres.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { width: containerSize, height: containerSize },
        ]}
      >
        <Text style={styles.emptyText}>No genres available</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.container,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
            },
            animatedStyle,
          ]}
        >
          <Svg width={containerSize} height={containerSize}>
            <G>
              {sunburstSegments.map((segment, index) => (
                <SunburstSegmentComponent
                  key={`${segment.name}-${index}`}
                  segment={segment}
                  centerX={containerSize / 2}
                  centerY={containerSize / 2}
                  isHovered={hoveredGenre === segment.name}
                  isLongPressed={longPressedGenre === segment.name}
                  isDiscovered={isGenreDiscovered(segment.name)}
                  onPress={() => {
                    // If it's a category, toggle expansion
                    if (segment.category === segment.name) {
                      setExpandedCategory(expandedCategory === segment.name ? null : segment.name);
                    } else {
                      // If it's a genre, navigate to detail
                      navigation.navigate('GenreDetail', { genreName: segment.name });
                    }
                  }}
                  onHoverIn={() => handleHover(segment.name)}
                  onHoverOut={() => {
                    handleUnhover();
                    if (longPressedGenre === segment.name) {
                      handleLongPressEnd();
                    }
                  }}
                  onLongPressStart={() => handleLongPressStart(segment.name)}
                  onLongPressEnd={handleLongPressEnd}
                />
              ))}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSample, styles.legendDiscovered]} />
          <Text style={styles.legendText}>You've heard this</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSample, styles.legendUndiscovered]} />
          <Text style={styles.legendText}>New to you</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backgroundColor: "transparent",
  },
  genreCard: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  genreCardText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Lato_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sunburstSegment: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
  },
  sunburstText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Lato_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    fontFamily: "Lato_400Regular",
  },
  legend: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#39ff14",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendSample: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  legendDiscovered: {
    backgroundColor: "#ff00ff",
    opacity: 1,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  legendUndiscovered: {
    backgroundColor: "#888",
    opacity: 0.3,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Lato_700Bold",
  },
});

export default GenreGrid;
