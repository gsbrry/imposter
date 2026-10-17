// Premium glass palette: rich spring-leaf green accent on dark graphite.
// The `yellow*` keys are kept (not renamed) since ~150 call sites reference
// them — they now hold the green accent, not an actual yellow.
export const COLORS = {
  yellow: '#6FCF47',
  yellowDeep: '#3F8F24',
  white: '#FFFFFF',
  nearBlack: '#15171A',
  rose: '#F4536B',
  // Glass system
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(111,207,71,0.22)',
  glassBorderBright: 'rgba(255,255,255,0.5)',
  glassHover: 'rgba(255,255,255,0.1)',
  glassSheen: 'rgba(255,255,255,0.16)',
  glassTint: 'rgba(111,207,71,0.05)',
  // Text hierarchy
  textPrimary: '#FFFFFF',
  textBody: 'rgba(255,255,255,0.7)',
  textLabel: 'rgba(255,255,255,0.45)',
  textMuted: 'rgba(255,255,255,0.28)',
  // Accent (green) tints
  yellowGlass: 'rgba(111,207,71,0.16)',
  yellowBorder: 'rgba(111,207,71,0.4)',
  yellowGlow: 'rgba(111,207,71,0.5)',
  // Legacy aliases (kept for remaining references) — same dark-graphite family
  violet: '#15171A',
  violetGlass: 'rgba(255,255,255,0.06)',
  violetBorder: 'rgba(111,207,71,0.22)',
  violetOverlay: 'rgba(14,16,18,0.88)',
  roseGlow: 'rgba(244,83,107,0.4)',
};

export const FONTS = {
  extraBold: 'Nunito_800ExtraBold',
  bold: 'Nunito_700Bold',
  semiBold: 'Nunito_600SemiBold',
  regular: 'Nunito_400Regular',
};

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export const RADIUS = {
  card: 28,
  button: 50,
  icon: 18,
};
