// Impostr design v2: Honey and Cream.
// Values come from design/tokens.json (source of truth) plus a handful of
// derived helpers that tokens.json doesn't define directly (textFaint,
// honeyBorder, scrim, danger) — each documented below.

export const COLORS = {
  // Surfaces
  background: '#F4EFE4',
  backgroundDeep: '#EAE2CF',
  // Web-only surround behind the phone-width column on wide screens —
  // `--page` in impostr.css, not in tokens.json.
  pageSurround: '#ECE5D6',
  white: '#FFFFFF',

  // Text
  ink: '#1B1813',
  textBody: '#5C5547',
  textMuted: '#6F6757',
  // Dimmest text tier — tokens.json has no third tier, so this is an
  // ink-based alpha derivation, consistent with how tokens.json itself
  // derives `divider` from ink.
  textFaint: 'rgba(27,24,19,0.45)',
  // Secondary/dimmed text drawn on top of an ink surface (a selected
  // category tile, for example) — `.cat.sel .c` in impostr.css.
  onInkMuted: 'rgba(244,239,228,0.6)',

  // Honey (the one primary accent)
  honey: '#F2B705',
  honeyText: '#805B00',
  honeySoft: '#FBE7A1',
  onHoney: '#1B1813',
  // Translucent honey border for tinted badges/icon wraps — tokens.json
  // doesn't define this explicitly; derived from `honey` at low opacity.
  honeyBorder: 'rgba(242,183,5,0.35)',
  // White diagonal highlight laid over a solid honey fill (gradient
  // buttons/banners) — not in tokens.json, derived from `white`.
  honeySheen: 'rgba(255,255,255,0.3)',
  // Translucent ink, for small tinted shapes drawn on top of a honey
  // surface (an icon wrap on the Go Premium banner, for example).
  onHoneySoft: 'rgba(27,24,19,0.18)',
  // Secondary/dimmed text drawn on top of a honey surface.
  onHoneyMuted: 'rgba(27,24,19,0.65)',

  // Glass (floating layers only — cards, sheets, tab bar, icon buttons)
  glassFill: 'rgba(255,252,245,0.55)',
  glassFillStrong: 'rgba(255,253,248,0.80)',
  glassBorder: 'rgba(255,255,255,0.85)',

  // Lines
  divider: 'rgba(27,24,19,0.09)',
  dot: 'rgba(27,24,19,0.07)',

  // Background orbs (behind glass, per README's liquid-glass notes)
  orbHoney: '#FFD13D',
  orbCream: '#F6DCA0',
  orbLight: '#FFF6DC',

  // Avatar fills
  avatars: ['#FFD866', '#F4C7A1', '#CFE3B0', '#BFD8EE', '#E6CBEA', '#F2D7B6'],

  // Modal/sheet scrim — ported from the CSS `.dim` recipe.
  scrim: 'rgba(20,16,8,0.28)',

  // Not in tokens.json: a muted warm red kept only for pre-existing
  // "timer about to run out" urgency text. No red appears anywhere in the
  // crew/imposter reveal parity (see RevealCard).
  danger: '#C23B3B',
  // Tint/border derived from `danger`, for warning banners (a vote tie,
  // time running out).
  dangerSoft: 'rgba(194,59,59,0.08)',
  dangerBorder: 'rgba(194,59,59,0.2)',
};

export const GRADIENTS = {
  honeyButton: ['#F8CF4A', '#F2B705', '#DFA800'] as const,
};

export const FONTS = {
  // Outfit — headings, numbers, the word/timer display
  displayExtraBold: 'Outfit_800ExtraBold',
  displayBold: 'Outfit_700Bold',
  displaySemiBold: 'Outfit_600SemiBold',
  displayMedium: 'Outfit_500Medium',
  // Plus Jakarta Sans — body copy, labels, buttons
  bodyBold: 'PlusJakartaSans_700Bold',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodyRegular: 'PlusJakartaSans_400Regular',
};

// Font sizes from design/tokens.json `type`. Screens that haven't been
// rebuilt yet keep using raw fontSize numbers; new shared components use
// this scale directly.
export const TYPE = {
  hero: { fontFamily: FONTS.displayExtraBold, fontSize: 44, letterSpacing: -1.2 },
  word: { fontFamily: FONTS.displayExtraBold, fontSize: 52, letterSpacing: -1.6 },
  titleL: { fontFamily: FONTS.displayBold, fontSize: 28 },
  titleM: { fontFamily: FONTS.displayBold, fontSize: 20 },
  titleS: { fontFamily: FONTS.displaySemiBold, fontSize: 16 },
  body: { fontFamily: FONTS.bodyRegular, fontSize: 13.5, lineHeight: 19.6 },
  button: { fontFamily: FONTS.bodyBold, fontSize: 15 },
  label: { fontFamily: FONTS.bodySemiBold, fontSize: 10.5, letterSpacing: 1.2 },
};

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  // design/tokens.json `spacing` — used by the new shared components.
  screenX: 18,
  gap: 14,
  cardPadding: 16,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  sheet: 34,
  // Icon buttons (`.iconbtn` in impostr.css) use 12px, which sits outside
  // the named sm/md/lg/xl scale but is the literal CSS value.
  icon: 12,
};

export const SIZE = {
  button: 54,
  iconButton: 40,
  tabBar: 64,
  avatar: 34,
};

export const SHADOW = {
  card: { color: '#1C1404', opacity: 0.18, radius: 18, offsetY: 10, elevation: 4 },
  honeyButton: { color: '#F2B705', opacity: 0.55, radius: 14, offsetY: 10, elevation: 6 },
};

export const BLUR = {
  intensity: 40,
  tint: 'light' as const,
};
