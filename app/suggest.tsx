import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, X, CircleCheck as CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import PillButton from '../components/PillButton';

export default function SuggestCategoryScreen() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setLoading(true);
    try {
      await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryName,
          reason,
          appVersion: '1.0.0',
          platform: Platform.OS,
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color="rgba(255,255,255,0.5)"  />
        </TouchableOpacity>

        <View style={styles.header}>
          <MessageSquare size={32} color={COLORS.yellow} />
          <Text style={styles.title}>Suggest a Category</Text>
          <Text style={styles.sub}>
            Got an idea for a new category? Let us know!
          </Text>
        </View>

        {submitted ? (
          <View style={styles.successWrap}>
            <CheckCircle size={64} color={COLORS.yellow}  />
            <Text style={styles.successTitle}>Thank you!</Text>
            <Text style={styles.successText}>
              Your suggestion has been sent! We review all submissions.
            </Text>
            <PillButton label="Back to Settings" onPress={() => router.back()} variant="violet" style={{ marginTop: SPACING.sm }} />
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
                placeholderTextColor="rgba(255,255,255,0.25)"
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
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>

            <PillButton
              label={loading ? 'Sending...' : 'Send Suggestion'}
              onPress={handleSubmit}
              variant="yellow"
              disabled={!categoryName.trim() || loading}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nearBlack },
  safe: { flex: 1, padding: SPACING.sm, paddingTop: SPACING.md },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: SPACING.sm,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    marginTop: 32,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.white,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  form: { gap: SPACING.sm },
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.white,
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
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    color: COLORS.yellow,
  },
  successText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
