import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ghost } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PillButton from './PillButton';

const { width, height } = Dimensions.get('window');

// Deterministic-looking but visually random particle set
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 127.3 + 43) % (width - 8),
  y: (i * 89.7 + 71) % (height - 8),
  size: 2 + (i % 4),
  duration: 2800 + (i % 7) * 600,
  delay: (i % 9) * 320,
  opacity: 0.12 + (i % 5) * 0.07,
}));

function Particle({ x, y, size, duration, delay, opacity }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });
  const fadeOpacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, opacity, opacity, 0] });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: fadeOpacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

function HowToPlayModal({ onClose }) {
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, []);

  const slides = [
    {
      icon: '🎭',
      title: 'One Word, One Imposter',
      desc: "Everyone gets the same secret word — except one player who gets IMPOSTER. The imposter must blend in without knowing the word.",
    },
    {
      icon: '💬',
      title: 'Give Clues, Stay Sneaky',
      desc: "Players take turns giving one-word clues about the secret word. The imposter must give a convincing clue without revealing they don't know it.",
    },
    {
      icon: '🗳️',
      title: 'Vote & Reveal',
      desc: "After all clues, the group votes on who they think is the imposter. Crew wins by catching the imposter. Imposter wins by surviving the vote!",
    },
  ];

  const handleClose = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(onClose);
  };

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <View style={styles.modal}>
        <Text style={styles.modalEmoji}>{slides[slide].icon}</Text>
        <Text style={styles.modalTitle}>{slides[slide].title}</Text>
        <Text style={styles.modalDesc}>{slides[slide].desc}</Text>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.modalActions}>
          {slide < slides.length - 1 ? (
            <PillButton label="Next" onPress={() => setSlide(s => s + 1)} variant="yellow" style={styles.modalBtn} />
          ) : (
            <PillButton label="Got it!" onPress={handleClose} variant="yellow" style={styles.modalBtn} />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const glowAnim = useRef(new Animated.Value(0.55)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    // Entrance fade
    Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Ghost pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1700, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.55, duration: 1700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePlay = () => {
    if (navigation) navigation.navigate('Setup');
  };

  return (
    <View style={styles.container}>
      {/* Particles */}
      {PARTICLES.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} size={p.size}
          duration={p.duration} delay={p.delay} opacity={p.opacity} />
      ))}

      {/* Radial glow behind ghost */}
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.center, { opacity: titleAnim }]}>

          {/* Ghost icon */}
          <Animated.View style={[styles.ghostWrap, { opacity: glowAnim }]}>
            <Ghost size={64} color={COLORS.yellow} />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>IMPOSTR</Text>
          <Text style={styles.tagline}>Party Word Game</Text>

          {/* Buttons */}
          <View style={styles.actions}>
            <PillButton
              label="PLAY NOW"
              onPress={handlePlay}
              variant="yellow"
              style={styles.playBtn}
              textStyle={styles.playBtnText}
            />

            <TouchableOpacity onPress={() => setShowHow(true)} style={styles.howLink} activeOpacity={0.6}>
              <Text style={styles.howText}>How to play?</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </SafeAreaView>

      {showHow && <HowToPlayModal onClose={() => setShowHow(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.nearBlack,
  },
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingBottom: 80, // clear tab bar
  },
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.yellow,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.yellow,
    top: height / 2 - 200,
    alignSelf: 'center',
    opacity: 0.06,
    // blur approximated with a large shadow on the view
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 80,
    elevation: 0,
  },
  ghostWrap: {
    marginBottom: SPACING.sm,
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 38,
    color: COLORS.white,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: SPACING.xl,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playBtn: {
    width: '100%',
    maxWidth: 320,
    height: 56,
  },
  playBtnText: {
    fontFamily: FONTS.extraBold,
    fontSize: 17,
    letterSpacing: 2,
  },
  howLink: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  howText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textDecorationLine: 'underline',
  },
  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,10,30,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  modal: {
    backgroundColor: '#160E2E',
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.15)',
    shadowColor: COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: { fontSize: 48, marginBottom: SPACING.xs },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.yellow,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: SPACING.sm },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: COLORS.yellow, width: 16 },
  modalActions: { width: '100%' },
  modalBtn: { width: '100%' },
});
