import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, BLUR, SHADOW } from '../constants/theme';

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
  const { width } = useWindowDimensions();
  // Matches the design's clamp(38px, 14.5cqi, 54px).
  const titleSize = Math.max(38, Math.min(54, width * 0.145));

  return (
    <View style={styles.shadowWrap}>
      <View style={styles.card}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.content}>
          {badge}
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text
            style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.02 }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            maxFontSizeMultiplier={1.4}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={3}>{subtitle}</Text>
          )}
          {footer}
        </View>
      </View>
    </View>
  );
}

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
    height: 19.6 * 3,
    textAlign: 'center',
    color: COLORS.textBody,
  },
});
