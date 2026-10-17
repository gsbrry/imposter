import { useRef } from 'react';
import { Animated } from 'react-native';

/** Shared press-down bounce used by every button component. */
export function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 80, bounciness: 4 }).start();
  };

  return { scale, onPressIn, onPressOut };
}
