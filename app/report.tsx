import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, Platform, Linking, Keyboard,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Send, Check } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import SectionLabel from '../components/SectionLabel';
import GlassCard from '../components/GlassCard';
import TextField from '../components/TextField';
import Chip from '../components/Chip';
import Toggle from '../components/Toggle';
import ListRow from '../components/ListRow';
import InkButton from '../components/InkButton';
import GlassButton from '../components/GlassButton';
import {
  SUPPORT_EMAIL, REPORT_TYPES, REPORT_MAX_LENGTH, ReportType,
} from '../constants/support';

/**
 * Device details, gathered only when the player leaves the toggle on.
 * Nothing here identifies a person: no player names, no words from the
 * game, no device or advertising ID.
 */
function deviceDetails(): string {
  const version = Constants.expoConfig?.version ?? 'unknown';
  const build = Platform.OS === 'android'
    ? Constants.expoConfig?.android?.versionCode
    : Constants.expoConfig?.ios?.buildNumber;
  const model = [Device.brand, Device.modelName].filter(Boolean).join(' ');
  const os = [Device.osName ?? Platform.OS, Device.osVersion ?? String(Platform.Version)]
    .filter(Boolean)
    .join(' ');
  return [
    `App: Impostr ${version}${build ? ` (${build})` : ''}`,
    `Phone: ${model || 'unknown'}`,
    `OS: ${os}`,
  ].join('\n');
}

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  const initialType = REPORT_TYPES.includes(params.type as ReportType)
    ? (params.type as ReportType)
    : 'Bug';

  const [type, setType] = useState<ReportType>(initialType);
  const [message, setMessage] = useState('');
  const [includeDevice, setIncludeDevice] = useState(true);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const handleSend = async () => {
    if (!message.trim()) return;
    Keyboard.dismiss();

    // Only the type, what the player typed, and optionally the device
    // details. Player names and the secret word are never included.
    const body = [
      message.trim(),
      '',
      includeDevice ? `---\n${deviceDetails()}` : '',
    ].join('\n');

    const url =
      `mailto:${SUPPORT_EMAIL}`
      + `?subject=${encodeURIComponent(`Impostr report: ${type}`)}`
      + `&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
      setSent(true);
    } catch {
      // No mail app. The Help screen shows the address as copyable text.
      setFailed(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <ScreenBackground />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.inner}>
            <StepHeader label="Report" onBack={() => router.back()} />
            <View style={styles.doneWrap}>
              <View style={styles.doneTile}>
                <Check size={26} color={COLORS.honeyText} />
              </View>
              <AppText style={styles.title} maxFontSizeMultiplier={1.3}>Thank you.</AppText>
              <AppText style={[styles.sub, styles.centred]}>
                Your report is in your mail app, ready to send. We read every one.
              </AppText>
              <GlassButton
                label="Back to help"
                onPress={() => router.back()}
                style={styles.doneCta}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          <StepHeader label="Report" onBack={() => router.back()} />

          <View style={styles.heading}>
            <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Report a problem</AppText>
            <AppText style={styles.sub}>
              Tell us what happened. Device details are added for you.
            </AppText>
          </View>

          <View style={styles.types}>
            <SectionLabel>What kind?</SectionLabel>
            <View style={styles.chips}>
              {REPORT_TYPES.map(t => (
                <Chip
                  key={t}
                  label={t}
                  selected={type === t}
                  onPress={() => setType(t)}
                  accessibilityLabel={`Report type ${t}`}
                />
              ))}
            </View>
          </View>

          <TextField
            label="What happened?"
            value={message}
            onChangeText={setMessage}
            placeholder="The timer kept running after I paused"
            multiline
            maxLength={REPORT_MAX_LENGTH}
          />
          <AppText style={styles.counter}>
            {message.length} of {REPORT_MAX_LENGTH}
          </AppText>

          <GlassCard style={styles.deviceCard}>
            <ListRow
              title="Include device details"
              description="Phone model, Android version, app version"
              trailing={
                <Toggle
                  value={includeDevice}
                  onValueChange={setIncludeDevice}
                  accessibilityLabel="Include device details"
                />
              }
            />
          </GlassCard>

          {failed && (
            <AppText style={styles.failed}>
              No mail app found. Copy the address from the Help screen instead.
            </AppText>
          )}

          <View style={styles.spacer} />

          <InkButton
            label="Send report"
            onPress={handleSend}
            disabled={!message.trim()}
            icon={<Send size={17} color={COLORS.background} />}
          />
          <AppText style={styles.note}>No names or personal details are sent.</AppText>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: SPACING.gap,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    paddingBottom: 24,
    gap: SPACING.gap,
  },

  heading: { gap: 4 },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
  centred: { textAlign: 'center' },

  types: { gap: 8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  counter: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: -10,
  },

  deviceCard: { borderRadius: 16 },

  failed: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.honeyText,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },
  note: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  doneTile: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
    marginBottom: 2,
  },
  doneCta: { marginTop: SPACING.xs, alignSelf: 'stretch' },
});
