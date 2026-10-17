import { useCallback, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { WEB_FOCUS_RING_OFF, WEB_FOCUS_RING_ON } from '../constants/theme';

// Derived from TextInputProps rather than spelled out, because the concrete
// focus/blur event types have changed between React Native versions.
type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

/**
 * Spread onto a TextInput to replace the browser's default blue focus
 * outline with the design's honey ring. No-op on native, where both ring
 * constants are null.
 *
 * Existing onFocus/onBlur handlers can be passed through so this does not
 * swallow them.
 */
export function useWebFocusRing(onFocus?: FocusHandler, onBlur?: BlurHandler) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<FocusHandler>(
    e => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback<BlurHandler>(
    e => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  return {
    onFocus: handleFocus,
    onBlur: handleBlur,
    focusStyle: focused ? WEB_FOCUS_RING_ON : WEB_FOCUS_RING_OFF,
  };
}
