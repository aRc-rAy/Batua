/**
 * Typography System
 * Centralized font configuration for consistent typography across the app
 */

// Font Families - Using system fonts for better performance and consistency
export const fontFamilies = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // Alternative: You can use custom fonts like:
  // regular: 'Roboto-Regular',
  // medium: 'Roboto-Medium', 
  // bold: 'Roboto-Bold',
} as const;

// Font Sizes - Standardized scale for consistent sizing
export const fontSizes = {
  xs: 12,     // Extra small - Labels, captions, fine print
  sm: 14,     // Small - Secondary text, descriptions
  base: 16,   // Base - Body text, buttons, main content
  lg: 18,     // Large - Subheadings, welcome text
  xl: 20,     // Extra large - Section titles
  xxl: 24,    // Main headings, screen titles
  xxxl: 28,   // App icons, large display text
  display: 32, // Hero text, display purposes
} as const;

// Font Weights - Standardized weights
export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Line Heights - Optimal spacing for different text sizes
export const lineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
  display: 44,
} as const;

// Predefined text styles for common use cases
export const textStyles = {
  // Display text (hero, main titles)
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.display,
    fontFamily: fontFamilies.bold,
  },
  
  // Main headings (screen titles)
  heading: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xxl,
    fontFamily: fontFamilies.bold,
  },
  
  // Subheadings (section titles)
  subheading: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.xl,
    fontFamily: fontFamilies.medium,
  },
  
  // Large text (welcome messages, important info)
  large: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.lg,
    fontFamily: fontFamilies.medium,
  },
  
  // Body text (main content)
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.base,
    fontFamily: fontFamilies.regular,
  },
  
  // Body text (medium weight)
  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.base,
    fontFamily: fontFamilies.medium,
  },
  
  // Body text (semibold)
  bodySemibold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.base,
    fontFamily: fontFamilies.medium,
  },
  
  // Small text (secondary info, descriptions)
  small: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.sm,
    fontFamily: fontFamilies.regular,
  },
  
  // Small text (medium weight)
  smallMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
    fontFamily: fontFamilies.medium,
  },
  
  // Small text (semibold)
  smallSemibold: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
    fontFamily: fontFamilies.medium,
  },
  
  // Caption text (labels, fine print)
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.xs,
    fontFamily: fontFamilies.regular,
  },
  
  // Caption text (medium weight)
  captionMedium: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.xs,
    fontFamily: fontFamilies.medium,
  },
  
  // Button text
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.base,
    fontFamily: fontFamilies.medium,
  },
  
  // Small button text
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
    fontFamily: fontFamilies.medium,
  },
} as const;

// Helper function to create text styles with theme colors
export const createTextStyle = (
  style: keyof typeof textStyles,
  color?: string,
  additionalStyles?: object
) => ({
  ...textStyles[style],
  ...(color && { color }),
  ...additionalStyles,
});

// Type definitions for TypeScript
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type FontFamily = keyof typeof fontFamilies;
export type TextStyle = keyof typeof textStyles;
