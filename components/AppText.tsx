import React, { useMemo } from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Text that honours Settings > Larger text.
 *
 * The system font scale is applied by React Native already; this adds the
 * app's own multiplier on top, so the two compose. Screens import this in
 * place of `Text` from react-native. Font size and line height are scaled
 * together so leading stays proportional.
 */
export default function AppText({ style, ...rest }: TextProps) {
  const { textScale } = useAccessibility();

  const scaled = useMemo(() => {
    if (textScale === 1) return style;
    const flat = StyleSheet.flatten(style) ?? {};
    if (typeof flat.fontSize !== 'number') return style;
    return [
      style,
      {
        fontSize: flat.fontSize * textScale,
        ...(typeof flat.lineHeight === 'number'
          ? { lineHeight: flat.lineHeight * textScale }
          : null),
      },
    ];
  }, [style, textScale]);

  return <RNText {...rest} style={scaled} />;
}
