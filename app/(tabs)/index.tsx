import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ghost, Drama, MessageCircle, Vote } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import PrimaryButton from '../../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1.5,
  speed: Math.random() * 0.3 + 0.1,
  opacity: Math.random() * 0.25 + 0.05,
}));

function Particle({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 4000 + Math.random() * 5000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 4000 + Math.random() * 5000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
  const op = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, opacity, 0] });

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
          opacity: op,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {PARTICLES.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} size={p.size} opacity={p.opacity} />
      ))}

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.center,
            { opacity: entryAnim, transform: [{ translateY: entryY }] },
          ]}
        >
          <Animated.View style={[styles.iconWrap, { opacity: glowAnim }]}>
            <View style={styles.iconCircle}>
              <Ghost size={40} color={COLORS.honey} />
            </View>
          </Animated.View>

          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            IMPOSTR
          </Text>
          <Text style={styles.subtitle}>PARTY WORD GAME</Text>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              label="PLAY NOW"
              onPress={() => router.push('/setup')}
              style={styles.playBtn}
            />

            <TouchableOpacity onPress={() => setShowHowToPlay(true)} style={styles.howLink}>
              <Text style={styles.howText}>How to play?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </View>
  );
}

function HowToPlayModal({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  const slides = [
    {
      Icon: Drama,
      title: 'One Word, One Imposter',
      desc: 'Everyone gets the same secret word — except one player who is the IMPOSTER. They must blend in without knowing the word.',
    },
    {
      Icon: MessageCircle,
      title: 'Give Clues, Stay Sneaky',
      desc: "Players take turns giving one-word clues. The imposter must give a convincing clue without revealing they don't know it.",
    },
    {
      Icon: Vote,
      title: 'Vote & Reveal',
      desc: 'After all clues, vote on who you think is the imposter. Crew wins by catching them. Imposter wins by surviving!',
    },
  ];

  useEffect(() => {
    slideAnim.setValue(0);
    slideY.setValue(16);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [slide]);

  const SlideIcon = slides[slide].Icon;

  return (
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
        <Animated.View style={{ opacity: slideAnim, transform: [{ translateY: slideY }] }}>
          <View style={styles.modalIconWrap}>
            <SlideIcon size={28} color={COLORS.honey} strokeWidth={1.75} />
          </View>
          <Text style={styles.modalTitle}>{slides[slide].title}</Text>
          <Text style={styles.modalDesc}>{slides[slide].desc}</Text>
        </Animated.View>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.modalActions}>
          {slide < slides.length - 1 ? (
            <PrimaryButton label="Next" onPress={() => setSlide(s => s + 1)} style={styles.modalBtn} />
          ) : (
            <PrimaryButton label="Got it!" onPress={onClose} style={styles.modalBtn} />
          )}
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.honey,
  },
  iconWrap: {
    marginBottom: SPACING.md,
    shadowColor: COLORS.honey,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 48,
    color: COLORS.ink,
    letterSpacing: 6,
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: SPACING.xl,
    textTransform: 'uppercase',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playBtn: {
    width: '100%',
    maxWidth: 320,
  },
  howLink: {
    padding: SPACING.xs,
  },
  howText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: COLORS.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modal: {
    backgroundColor: COLORS.glassFillStrong,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.honey,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalDesc: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 15,
    color: COLORS.textBody,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: SPACING.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.divider,
  },
  dotActive: {
    backgroundColor: COLORS.honey,
    width: 20,
  },
  modalActions: { width: '100%' },
  modalBtn: { width: '100%' },
});
