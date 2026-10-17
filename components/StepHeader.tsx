import React from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import AppText from './AppText';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, SIZE } from '../constants/theme';
import IconButton from './IconButton';

interface StepHeaderProps {
  /** 1-based step; omit for a plain titled header with no progress bars. */
  step?: number;
  totalSteps?: number;
  label: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
}

/**
 * Back button, centred step label and the 3 progress bars.
 * Matches the NAV() fragment in design/assets/screens.js.
 */
export default function StepHeader({
  step, totalSteps = 3, label, onBack, backAccessibilityLabel = 'Go back',
}: StepHeaderProps) {
  return (
    <View style={styles.row}>
      <IconButton onPress={onBack} accessibilityLabel={backAccessibilityLabel}>
        <ChevronLeft size={20} color={COLORS.ink} />
      </IconButton>

      <View style={styles.center}>
        <AppText style={styles.label}>{label.toUpperCase()}</AppText>
        {step !== undefined && (
          <View style={styles.steps}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <View key={i} style={[styles.stepBar, i < step && styles.stepBarOn]} />
            ))}
          </View>
        )}
      </View>

      {/* Balances the back button so the label stays centred. */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  center: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  steps: {
    flexDirection: 'row',
    gap: 4,
  },
  stepBar: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
  },
  stepBarOn: {
    backgroundColor: COLORS.honey,
  },
  spacer: {
    width: SIZE.iconButton,
  },
});
