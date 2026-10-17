import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, Platform, TouchableOpacity, Linking, LayoutAnimation,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Flag, CircleX, Crown, ChevronRight, ChevronDown, Copy, Check,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import SectionLabel from '../components/SectionLabel';
import GlassCard from '../components/GlassCard';
import ListRow, { listRowStyles } from '../components/ListRow';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  SUPPORT_EMAIL, PLAY_SUBSCRIPTIONS_URL, QUICK_ANSWERS, SUPPORT_REPLY_TIME,
} from '../constants/support';

// CustomerCenter is native-only.
let CustomerCenterModule: any = null;
if (Platform.OS !== 'web') {
  try {
    CustomerCenterModule = require('react-native-purchases-ui');
  } catch { /* not available */ }
}

export default function HelpScreen() {
  const router = useRouter();
  const { reduceMotion } = useAccessibility();
  const [openAnswer, setOpenAnswer] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const copyEmail = async () => {
    try {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* the address is on screen either way */ }
  };

  const toggleAnswer = (index: number) => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOpenAnswer(current => (current === index ? null : index));
  };

  /**
   * Purchase help goes to RevenueCat's customer centre where it exists, and
   * falls back to the Play subscriptions page, which is where a refund or a
   * cancellation actually happens.
   */
  const openPurchaseHelp = async () => {
    if (Platform.OS !== 'web' && CustomerCenterModule) {
      try {
        await CustomerCenterModule.CustomerCenter.presentCustomerCenter();
        return;
      } catch { /* fall through to Play */ }
    }
    Linking.openURL(PLAY_SUBSCRIPTIONS_URL).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <StepHeader label="Help" onBack={() => router.back()} />

          <AppText style={styles.title} maxFontSizeMultiplier={1.4}>How can we help?</AppText>

          <GlassCard style={styles.card}>
            <ListRow
              icon={<Flag size={17} color={COLORS.honeyText} />}
              title="Report a problem"
              description="Something broke or looks wrong"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={() => router.push({ pathname: '/report', params: { type: 'Bug' } })}
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<CircleX size={17} color={COLORS.honeyText} />}
              title="Report a word"
              description="Wrong, unfair or not suitable"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={() => router.push({ pathname: '/report', params: { type: 'Bad word' } })}
            />
            <View style={listRowStyles.divider} />
            <ListRow
              icon={<Crown size={17} color={COLORS.honeyText} />}
              title="Purchase help"
              description="Restore, refunds, manage plan"
              trailing={<ChevronRight size={18} color={COLORS.textMuted} />}
              onPress={openPurchaseHelp}
            />
          </GlassCard>

          <SectionLabel>Quick answers</SectionLabel>
          <GlassCard style={styles.card}>
            {QUICK_ANSWERS.map((qa, i) => {
              const open = openAnswer === i;
              return (
                <View key={qa.question}>
                  {i > 0 && <View style={listRowStyles.divider} />}
                  <TouchableOpacity
                    onPress={() => toggleAnswer(i)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={qa.question}
                    style={styles.qaRow}
                  >
                    <AppText style={styles.question}>{qa.question}</AppText>
                    {open
                      ? <ChevronDown size={18} color={COLORS.textMuted} />
                      : <ChevronRight size={18} color={COLORS.textMuted} />}
                  </TouchableOpacity>
                  {open && <AppText style={styles.answer}>{qa.answer}</AppText>}
                </View>
              );
            })}
          </GlassCard>

          {/* The address is plain text, so it is reachable with no mail app. */}
          <GlassCard style={styles.emailCard}>
            <SectionLabel>Email us</SectionLabel>
            <View style={styles.emailRow}>
              <AppText style={styles.email} selectable numberOfLines={1} adjustsFontSizeToFit>
                {SUPPORT_EMAIL}
              </AppText>
              <TouchableOpacity
                onPress={copyEmail}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={copied ? 'Email address copied' : 'Copy email address'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.copyBtn}
              >
                {copied
                  ? <Check size={17} color={COLORS.honeyText} />
                  : <Copy size={17} color={COLORS.ink} />}
              </TouchableOpacity>
            </View>
            <AppText style={styles.emailNote}>
              {copied ? 'Copied to the clipboard.' : SUPPORT_REPLY_TIME}
            </AppText>
          </GlassCard>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 10,
  },

  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
    marginBottom: 2,
  },

  card: { borderRadius: RADIUS.lg },

  qaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 48,
  },
  question: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  answer: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.textBody,
    paddingHorizontal: 14,
    paddingBottom: 12,
    marginTop: -2,
  },

  emailCard: {
    borderRadius: RADIUS.lg,
    padding: 14,
    gap: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  email: {
    flex: 1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassFillStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  emailNote: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
