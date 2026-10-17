import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useWebFocusRing } from '../hooks/useWebFocusRing';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
}

/** Matches impostr.css `.field` / `.input` / `.input.ta` (multiline). */
export default function TextField({ label, multiline, onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const focusRing = useWebFocusRing(onFocus, onBlur);

  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...inputProps}
        multiline={multiline}
        onFocus={focusRing.onFocus}
        onBlur={focusRing.onBlur}
        placeholderTextColor={COLORS.textFaint}
        style={[styles.input, multiline && styles.inputMultiline, focusRing.focusStyle]}
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.ink,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
});
