import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Switch,
  TouchableOpacity, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Timer, Volume2, Vibrate, Star, MessageSquare, ChevronRight, Crown } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import { storage, Settings } from '../../utils/storage';
import { useGame } from '../../context/GameContext';
import { usePremium } from '@/hooks/usePremium';
import { REVIEW_UNLOCK_TAPS } from '@/constants/reviewAccess';

// CustomerCenter is native-only
let CustomerCenterModule: any = null;
if (Platform.OS !== 'web') {
  try {
    CustomerCenterModule = require('react-native-purchases-ui');
  } catch { /* not available */ }
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium, setIsPremium } = useGame();
  const { getExpiryDate } = usePremium();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;

  const [settings, setSettings] = useState<Settings>({
    timerEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
  });
  const [timerSound, setTimerSound] = useState(true);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [unlockTaps, setUnlockTaps] = useState(0);
  const [reviewUnlocked, setReviewUnlocked] = useState(false);

  useEffect(() => {
    Promise.all([storage.getSettings(), storage.getTimerSound()]).then(([s, ts]) => {
      setSettings(s);
      setTimerSound(ts);
      Animated.parallel([
        Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
    if (isPremium) {
      getExpiryDate().then(setExpiryDate);
    }
  }, [isPremium]);

  // Lets a Play reviewer reach the subscription-only categories. See
  // constants/reviewAccess.ts for why this exists.
  const handleVersionTap = async () => {
    if (isPremium) return;
    const next = unlockTaps + 1;
    setUnlockTaps(next);
    if (next >= REVIEW_UNLOCK_TAPS) {
      await storage.setReviewUnlock(true);
      setIsPremium(true);
      setReviewUnlocked(true);
      setUnlockTaps(0);
    }
  };

  const update = async (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await storage.setSettings(next);
  };

  const updateTimerSound = async (value: boolean) => {
    setTimerSound(value);
    await storage.setTimerSound(value);
  };

  const openCustomerCenter = async () => {
    if (Platform.OS === 'web' || !CustomerCenterModule) return;
    try {
      await CustomerCenterModule.CustomerCenter.presentCustomerCenter();
    } catch (e) {
      console.warn('Customer Center failed:', e);
    }
  };

  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <View style={styles.header}>
            <Text style={styles.label}>PREFERENCES</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Settings</Text>
              {isPremium && (
                <View style={styles.crownBadge}>
                  <Crown size={14} color={COLORS.nearBlack} />
                  <Text style={styles.crownText}>PREMIUM</Text>
                </View>
              )}
            </View>
          </View>

          {/* Premium status card */}
          {isPremium && (
            <>
              <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
              <GlassCard style={styles.premiumCard}>
                <View style={styles.premiumCardInner}>
                  <View style={styles.premiumIconWrap}>
                    <Crown size={20} color={COLORS.nearBlack} />
                  </View>
                  <View style={styles.premiumCardText}>
                    <Text style={styles.premiumActiveLabel}>Premium Active</Text>
                    {formattedExpiry && (
                      <Text style={styles.premiumExpiry}>Renews {formattedExpiry}</Text>
                    )}
                  </View>
                </View>
                {Platform.OS !== 'web' && (
                  <>
                    <View style={styles.divider} />
                    <SettingLink
                      icon={<Star size={18} color={COLORS.yellow} />}
                      label="Manage Subscription"
                      onPress={openCustomerCenter}
                    />
                  </>
                )}
              </GlassCard>
            </>
          )}

          <Text style={[styles.sectionLabel, isPremium && { marginTop: SPACING.md }]}>GAMEPLAY</Text>
          <GlassCard style={styles.section}>
            <SettingRow
              icon={<Timer size={18} color={COLORS.yellow} />}
              label="Round Timer"
              description="Show countdown during clue round"
              value={settings.timerEnabled}
              onChange={v => update('timerEnabled', v)}
            />
            <Divider />
            <SettingRow
              icon={<Timer size={18} color={COLORS.yellow} />}
              label="Timer sounds"
              description="Tick and shutter sounds during countdown"
              value={timerSound}
              onChange={updateTimerSound}
            />
            <Divider />
            <SettingRow
              icon={<Volume2 size={18} color={COLORS.yellow} />}
              label="Sound Effects"
              description="Blip on reveal, fanfare on game end"
              value={settings.soundEnabled}
              onChange={v => update('soundEnabled', v)}
            />
            <Divider />
            <SettingRow
              icon={<Vibrate size={18} color={COLORS.yellow} />}
              label="Haptic Feedback"
              description="Vibration on imposter reveal"
              value={settings.hapticsEnabled}
              onChange={v => update('hapticsEnabled', v)}
            />
          </GlassCard>

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>MORE</Text>
          <GlassCard style={styles.section}>
            {!isPremium && (
              <>
                <SettingLink
                  icon={<Star size={18} color={COLORS.yellow} />}
                  label="Go Premium"
                  onPress={() => router.push('/premium')}
                />
                <Divider />
              </>
            )}
            <SettingLink
              icon={<MessageSquare size={18} color={COLORS.yellow} />}
              label="Suggest a Category"
              onPress={() => router.push('/suggest')}
            />
          </GlassCard>

          <TouchableOpacity activeOpacity={1} onPress={handleVersionTap}>
            <Text style={styles.version}>
              {reviewUnlocked ? 'Impostr v1.0 - review access on' : 'Impostr v1.0'}
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingRow({
  icon, label, description, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.08)', true: 'rgba(255,214,0,0.4)' }}
        thumbColor={value ? COLORS.yellow : 'rgba(255,255,255,0.4)'}
      />
    </View>
  );
}

function SettingLink({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <ChevronRight size={16} color={COLORS.textLabel} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: SPACING.md, paddingBottom: 100 },
  header: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  crownText: {
    fontFamily: FONTS.extraBold,
    fontSize: 10,
    color: COLORS.nearBlack,
    letterSpacing: 0.5,
  },

  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
    paddingLeft: 2,
  },
  section: { marginBottom: 0 },

  // Premium card
  premiumCard: { marginBottom: 0 },
  premiumCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 16,
    gap: 12,
  },
  premiumIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCardText: { flex: 1, gap: 2 },
  premiumActiveLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.yellow,
  },
  premiumExpiry: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLabel,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 16,
    gap: 12,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.yellowGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  rowDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLabel,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.sm,
  },
  version: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
