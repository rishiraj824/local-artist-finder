// Inter font - Modern, clean, optimized for UI
// Professional choice used by many top apps
const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Compact font sizes - optimized for information density
export const fontSize = {
  xs: 11,      // Very small labels, metadata
  sm: 12,      // Small labels, captions
  base: 14,    // Body text, default
  md: 15,      // Emphasized body text
  lg: 16,      // Section headers, subtitles
  xl: 18,      // Card titles
  '2xl': 20,   // Page titles
  '3xl': 24,   // Large headers
  '4xl': 28,   // Display text
};

// Font weights
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Line heights - tighter for compact layout
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

// Letter spacing - subtle tracking
export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.5,
};

// Typography presets for common use cases
export const typography = {
  // Headers
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.xl * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.lg * lineHeight.normal,
  },

  // Body text
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
  },

  // Labels and captions
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Buttons
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.sm * lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
  buttonLarge: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.base * lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
};

export { fontFamily };
