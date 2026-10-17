import React, { useState } from 'react';
import {
  View, StyleSheet, Modal, Pressable, Platform,
} from 'react-native';
import AppText from './AppText';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { House } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SPACING, BLUR, SHADOW } from '../constants/theme';
import { useGame } from '../context/GameContext';
import IconButton from './IconButton';
import PrimaryButton from './PrimaryButton';
import GlassButton from './GlassButton';

export default function HomeButton() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { resetGame } = useGame();

  const confirm = () => {
    setVisible(false);
    resetGame();
    router.replace('/(tabs)');
  };

  return (
    <>
      <IconButton onPress={() => setVisible(true)} size={36} accessibilityLabel="End game and go home">
        <House size={18} color={COLORS.textMuted} />
      </IconButton>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.modalShadow}>
            <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
              {Platform.OS !== 'web' && (
                <BlurView intensity={BLUR.intensity} tint={BLUR.tint} style={StyleSheet.absoluteFill} />
              )}
              <View style={styles.iconWrap}>
                <House size={28} color={COLORS.honey} />
              </View>
              <AppText style={styles.heading}>End this game?</AppText>
              <AppText style={styles.sub}>Current game progress will be lost.</AppText>

              <PrimaryButton label="YES, GO HOME" onPress={confirm} style={styles.fullWidth} />
              <GlassButton label="Keep Playing" onPress={() => setVisible(false)} style={styles.fullWidth} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalShadow: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS.lg,
    shadowColor: SHADOW.card.color,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
  },
  modal: {
    backgroundColor: COLORS.glassFillStrong,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.honeySoft,
    borderWidth: 1,
    borderColor: COLORS.honeyBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heading: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: COLORS.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  fullWidth: {
    width: '100%',
  },
});
