import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Timer, Volume2, Vibrate, Star, MessageSquare, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import { storage, Settings } from '../../utils/storage';

const TIMER_SOUND_KEY = 'IMPOSTR_TIMER_SOUND';

export default function SettingsScreen() {
  const router = useRouter();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(20)).current;
  const [settings, setSettings] = useState<Settings>({
    timerEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
  });
  const [timerSound, setTimerSound] = useState(true);

  useEffect(() => {
    Promise.all([storage.getSettings(), storage.getTimerSound()]).then(([s, ts]) => {
      setSettings(s);
      setTimerSound(ts);
      Animated.parallel([
        Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const update = async (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await storage.setSettings(next);
  };

  const updateTimerSound = async (value: boolean) => {
    setTimerSound(value);
    await storage.setTimerSound(value);
  };

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
            <Text style={styles.title}>Settings</Text>
          </View>

          <Text style={styles.sectionLabel}>GAMEPLAY</Text>
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
            <Divider />
            <SettingRow
              icon={<Timer size={18} color={COLORS.yellow} />}
              label="Timer sounds"
              description="Tick and shutter sounds during countdown"
              value={timerSound}
              onChange={updateTimerSound}
            />
          </GlassCard>

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>MORE</Text>
          <GlassCard style={styles.section}>
            <SettingLink
              icon={<Star size={18} color={COLORS.yellow} />}
              label="Go Premium"
              onPress={() => router.push('/premium')}
            />
            <Divider />
            <SettingLink
              icon={<MessageSquare size={18} color={COLORS.yellow} />}
              label="Suggest a Category"
              onPress={() => router.push('/suggest')}
            />
          </GlassCard>

          <Text style={styles.version}>Impostr v1.0</Text>
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
  header: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
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
  section: {
    marginBottom: 0,
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
