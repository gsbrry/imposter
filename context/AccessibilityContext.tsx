import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode,
} from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { storage } from '../utils/storage';

/** How much "Larger text" grows type and controls by. */
export const LARGER_TEXT_SCALE = 1.15;

interface AccessibilityState {
  /** Multiplier applied on top of the system font scale. */
  textScale: number;
  /** True when the player asked for it, or the system did. */
  reduceMotion: boolean;
  /** True while TalkBack or VoiceOver is running. */
  screenReader: boolean;
  /** Re-read the stored preferences, after Settings changes one. */
  refresh: () => void;
}

const defaultState: AccessibilityState = {
  textScale: 1,
  reduceMotion: false,
  screenReader: false,
  refresh: () => {},
};

const AccessibilityContext = createContext<AccessibilityState>(defaultState);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largerText, setLargerText] = useState(false);
  const [prefersReduceMotion, setPrefersReduceMotion] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const refresh = useCallback(() => {
    storage.getSettings().then(s => {
      setLargerText(s.largerText);
      setPrefersReduceMotion(s.reduceMotion);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // System accessibility settings, watched so a change mid-session applies.
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion).catch(() => {});
    // react-native-web reports a screen reader as always present, which
    // would show the TalkBack-only hints to every web visitor. The flag is
    // only meaningful on a device.
    if (Platform.OS !== 'web') {
      AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => {});
    }

    const motionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged', setSystemReduceMotion
    );
    const readerSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged', setScreenReader
    );
    return () => {
      motionSub?.remove();
      readerSub?.remove();
    };
  }, []);

  const value = useMemo<AccessibilityState>(() => ({
    textScale: largerText ? LARGER_TEXT_SCALE : 1,
    // Either source turning it on is enough.
    reduceMotion: prefersReduceMotion || systemReduceMotion,
    screenReader,
    refresh,
  }), [largerText, prefersReduceMotion, systemReduceMotion, screenReader, refresh]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
