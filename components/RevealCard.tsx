import React from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import AppText from './AppText';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, BLUR, SHADOW, NATIVE_BLUR } from '../constants/theme';
import { useAccessibility } from '../context/AccessibilityContext';
import { useContentSize } from './ContentSize';

interface RevealCardProps {
  /** Rendered above the eyebrow — the category pill in the reveal flow. */
  badge?: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

/**
 * The single card used for both the crew word reveal and the imposter
 * reveal (design/screens/08 and 09, which are pixel-identical).
 *
 * Never branch this component's styling, size, animation or timing on who
 * is looking at it — only the strings passed in may differ. In a dark room
 * any difference in colour, brightness or layout would give the imposter
 * away to anyone watching the screen from across the table.
 */
export default function RevealCard({ badge, eyebrow, title, subtitle, footer }: RevealCardProps) {
  const { width } = useContentSize();
  const { textScale } = useAccessibility();
  // Matches the design's clamp(38px, 14.5cqi, 54px).
  const titleSize = Math.max(38, Math.min(54, width * 0.145));
  // The subtitle box is pinned to three lines so the card is the same
  // height whoever is holding it. That pin has to grow with the text, or
  // the third line is clipped at Larger text.
  const subtitleHeight = SUBTITLE_LINE_HEIGHT * 3 * textScale;

  return (
    <View style={styles.shadowWrap}>
      <View style={styles.card}>
        {NATIVE_BLUR && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.content}>
          {badge}
          <AppText style={styles.eyebrow}>{eyebrow.toUpperCase()}</AppText>
          <AppText
            style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.02 }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            maxFontSizeMultiplier={1.4}
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText style={[styles.subtitle, { height: subtitleHeight }]} numberOfLines={3}>{subtitle}</AppText>
          )}
          {footer}
        </View>
      </View>
    </View>
  );
}

/** One line of subtitle, matching the design's 19.6px leading. */
const SUBTITLE_LINE_HEIGHT = 19.6;

const styles = StyleSheet.create({
  shadowWrap: {
    flex: 1,
    borderRadius: 26,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: SHADOW.card.offsetY },
    shadowOpacity: SHADOW.card.opacity,
    shadowRadius: SHADOW.card.radius,
    elevation: SHADOW.card.elevation,
  },
  card: {
    flex: 1,
    minHeight: 300,
    borderRadius: 26,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  eyebrow: {
    marginTop: 2,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.displayExtraBold,
    letterSpacing: -1.6,
    textAlign: 'center',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    maxWidth: 260,
    // Reserved at three lines so a longer string for one role cannot make
    // that card taller than the other. See the note on this component.
    textAlign: 'center',
    color: COLORS.textBody,
  },
});
