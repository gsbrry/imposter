import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * The size of the area a screen actually draws into.
 *
 * On a phone that is the window. Inside PhoneFrame's centred tablet column
 * it is the column, so anything that scales with the width — the orbs, the
 * reveal title, the timer ring — sizes to what the player sees rather than
 * to a 1280dp tablet window.
 */
interface ContentSize {
  width: number;
  height: number;
}

const ContentSizeContext = createContext<ContentSize | null>(null);

export function ContentSizeProvider({
  width, height, children,
}: ContentSize & { children: ReactNode }) {
  const value = useMemo(() => ({ width, height }), [width, height]);
  return (
    <ContentSizeContext.Provider value={value}>
      {children}
    </ContentSizeContext.Provider>
  );
}

/** Falls back to the window, so screens outside a column still work. */
export function useContentSize(): ContentSize {
  const window = useWindowDimensions();
  return useContext(ContentSizeContext) ?? { width: window.width, height: window.height };
}
