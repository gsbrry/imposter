import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, Keyboard,
} from 'react-native';
import AppText from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Send from 'lucide-react-native/dist/esm/icons/send';
import Check from 'lucide-react-native/dist/esm/icons/check';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import StepHeader from '../components/StepHeader';
import SectionLabel from '../components/SectionLabel';
import TextField from '../components/TextField';
import Chip from '../components/Chip';
import InkButton from '../components/InkButton';
import GlassButton from '../components/GlassButton';
import { storage } from '../utils/storage';

const POPULAR_IDEAS = ['Street food', '90s cartoons', 'Indian cities', 'Board games'];

export default function SuggestCategoryScreen() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    Keyboard.dismiss();
    setSaving(true);
    // Suggestions stay on the device. Nothing about this app leaves the phone.
    await storage.addSuggestion(categoryName.trim(), reason.trim());
    setSaving(false);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View
          style={[styles.inner, { opacity: entryAnim, transform: [{ translateY: entryY }] }]}
        >
          <StepHeader label="Feedback" onBack={() => router.back()} />

          {submitted ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneTile}>
                <Check size={26} color={COLORS.honeyText} />
              </View>
              <AppText style={styles.title} maxFontSizeMultiplier={1.3}>Saved.</AppText>
              <AppText style={[styles.sub, styles.doneSub]}>
                Your idea is kept on this phone. We gather suggestions with each
                update, so watch for new packs.
              </AppText>
              <GlassButton
                label="Back to settings"
                onPress={() => router.back()}
                style={styles.doneCta}
              />
            </View>
          ) : (
            <>
              <View style={styles.heading}>
                <AppText style={styles.title} maxFontSizeMultiplier={1.4}>Suggest a category</AppText>
                <AppText style={styles.sub}>The best ideas become new packs.</AppText>
              </View>

              <TextField
                label="Category name"
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Cricket legends"
                maxLength={50}
                returnKeyType="next"
              />

              <TextField
                label="Why would it be fun? (optional)"
                value={reason}
                onChangeText={setReason}
                placeholder="Everyone in our group argues about who the greatest is..."
                multiline
                maxLength={200}
              />

              <View style={styles.ideas}>
                <SectionLabel>Popular ideas</SectionLabel>
                <View style={styles.chips}>
                  {POPULAR_IDEAS.map(idea => (
                    <Chip
                      key={idea}
                      label={idea}
                      selected={categoryName === idea}
                      onPress={setCategoryName}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.spacer} />

              <InkButton
                label={saving ? 'Saving...' : 'Send suggestion'}
                onPress={handleSubmit}
                disabled={!categoryName.trim() || saving}
                icon={<Send size={17} color={COLORS.background} />}
              />
            </>
          )}
        </Animated.View>
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

  ideas: { gap: 8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  spacer: { flex: 1, minHeight: SPACING.xs },

  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  doneTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.honeySoft,
    marginBottom: 2,
  },
  doneSub: { textAlign: 'center' },
  doneCta: { marginTop: SPACING.xs, alignSelf: 'stretch' },
});
