import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface TabBarVisibilityValue {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityValue>({
  hidden: false,
  setHidden: () => {},
});

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <TabBarVisibilityContext.Provider value={{ hidden, setHidden }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarHidden() {
  return useContext(TabBarVisibilityContext).hidden;
}

/**
 * Hides the floating tab bar while `hide` is true. A sheet is drawn inside
 * its own screen, so it cannot paint over the navigator's tab bar; pulling
 * the bar out of the way is what keeps a sheet looking like a sheet.
 */
export function useHideTabBar(hide: boolean) {
  const { setHidden } = useContext(TabBarVisibilityContext);
  const reset = useCallback(() => setHidden(false), [setHidden]);

  useEffect(() => {
    setHidden(hide);
    return reset;
  }, [hide, setHidden, reset]);
}
