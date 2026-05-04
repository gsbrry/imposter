import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { House } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useGame } from '../context/GameContext';

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
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <House size={18} color={COLORS.textLabel} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
            <View style={styles.iconWrap}>
              <House size={28} color={COLORS.yellow} />
            </View>
            <Text style={styles.heading}>End this game?</Text>
            <Text style={styles.sub}>Current game progress will be lost.</Text>

            <TouchableOpacity style={styles.btnYes} onPress={confirm} activeOpacity={0.85}>
              <Text style={styles.btnYesText}>YES, GO HOME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnKeep} onPress={() => setVisible(false)} activeOpacity={0.85}>
              <Text style={styles.btnKeepText}>Keep Playing</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,4,18,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.yellowGlass,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLabel,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  btnYes: {
    width: '100%',
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnYesText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.nearBlack,
    letterSpacing: 1,
  },
  btnKeep: {
    width: '100%',
    height: 56,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnKeepText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textBody,
  },
});