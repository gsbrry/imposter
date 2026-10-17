import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageSquare, X, CircleCheck as CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';
import GlassButton from '../components/GlassButton';
import IconButton from '../components/IconButton';
import { storage } from '../utils/storage';

export default function SuggestCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categoryName, setCategoryName] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setLoading(true);
    // Suggestions stay on the device. Nothing about this app leaves the phone.
    await storage.addSuggestion(categoryName.trim(), reason.trim());
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <IconButton
          onPress={() => router.back()}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          accessibilityLabel="Close"
        >
          <X size={22} color={COLORS.textFaint} />
        </IconButton>

        <View style={styles.header}>
          <MessageSquare size={32} color={COLORS.honey} />
          <Text style={styles.title}>Suggest a Category</Text>
          <Text style={styles.sub}>
            Got an idea for a new category? Jot it down.
          </Text>
        </View>

        {submitted ? (
          <View style={styles.successWrap}>
            <CheckCircle size={64} color={COLORS.honey}  />
            <Text style={styles.successTitle}>Saved!</Text>
            <Text style={styles.successText}>
              Your idea is saved on this device. We gather suggestions in app
              updates, so keep an eye out for new categories.
            </Text>
            <GlassButton label="Back to Settings" onPress={() => router.back()} style={{ marginTop: SPACING.sm }} />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category Name *</Text>
              <TextInput
                style={styles.input}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="e.g. Indian Street Food"
                placeholderTextColor={COLORS.textFaint}
                maxLength={50}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Why would it be fun? (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={reason}
                onChangeText={setReason}
                placeholder="Tell us why this category would make a great game..."
                placeholderTextColor={COLORS.textFaint}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>

            <PrimaryButton
              label={loading ? 'Saving...' : 'Save Suggestion'}
              onPress={handleSubmit}
              disabled={!categoryName.trim() || loading}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1, padding: SPACING.sm, paddingTop: SPACING.md },
  closeBtn: {
    position: 'absolute',
    right: SPACING.sm,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    marginTop: 32,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.ink,
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  form: { gap: SPACING.sm },
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textBody,
  },
  input: {
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 14,
    fontFamily: FONTS.bodyRegular,
    fontSize: 15,
    color: COLORS.ink,
  },
  inputMulti: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  successTitle: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 28,
    color: COLORS.honey,
  },
  successText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 15,
    color: COLORS.textBody,
    textAlign: 'center',
    lineHeight: 22,
  },
});
