import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, BLUR, SHADOW } from '../constants/theme';

interface RevealCardProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

/**
 * The single card used for both the crew word reveal and the imposter
 * reveal. Same colours, size and layout every time — only the text passed
 * in changes. Never branch this component's styling on who is viewing it;
 * that is the only thing that would give the imposter away in a dark room.
 */
export default function RevealCard({ icon, eyebrow, title, subtitle, footer }: RevealCardProps) {
  return (
    <View style={styles.shadowWrap}>
      <View style={styles.card}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.content}>
          {icon}
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
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
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 36,
    letterSpacing: -1,
    textAlign: 'center',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textBody,
  },
});
