# Typography System Usage Guide

## Overview

The typography system provides consistent font sizes, weights, and styles across the entire app. It's located in `src/utils/typography.ts`.

## How to Use

### 1. Import the typography utilities

```typescript
import {
  textStyles,
  fontSizes,
  fontWeights,
  fontFamilies,
} from '../utils/typography';
```

### 2. Apply predefined text styles (Recommended)

```typescript
const styles = StyleSheet.create({
  heading: {
    ...textStyles.heading, // 24px, bold
    color: theme.colors.text,
  },
  subheading: {
    ...textStyles.subheading, // 20px, semibold
    color: theme.colors.text,
  },
  body: {
    ...textStyles.body, // 16px, normal
    color: theme.colors.text,
  },
  button: {
    ...textStyles.button, // 16px, semibold
    color: '#ffffff',
  },
});
```

### 3. Use individual typography values

```typescript
const styles = StyleSheet.create({
  customText: {
    fontSize: fontSizes.lg, // 18px
    fontWeight: fontWeights.medium, // 500
    fontFamily: fontFamilies.regular,
    color: theme.colors.text,
  },
});
```

## Available Text Styles

| Style           | Font Size | Weight   | Use Case                         |
| --------------- | --------- | -------- | -------------------------------- |
| `display`       | 32px      | Bold     | Hero text, display purposes      |
| `heading`       | 24px      | Bold     | Main headings, screen titles     |
| `subheading`    | 20px      | Semibold | Section titles                   |
| `large`         | 18px      | Semibold | Welcome messages, important info |
| `body`          | 16px      | Normal   | Main content                     |
| `bodyMedium`    | 16px      | Medium   | Main content (medium weight)     |
| `bodySemibold`  | 16px      | Semibold | Main content (semibold)          |
| `small`         | 14px      | Normal   | Secondary info, descriptions     |
| `smallMedium`   | 14px      | Medium   | Secondary info (medium weight)   |
| `smallSemibold` | 14px      | Semibold | Secondary info (semibold)        |
| `caption`       | 12px      | Normal   | Labels, fine print               |
| `captionMedium` | 12px      | Medium   | Labels (medium weight)           |
| `button`        | 16px      | Semibold | Button text                      |
| `buttonSmall`   | 14px      | Semibold | Small button text                |

## Font Sizes Scale

| Size      | Value | Usage                               |
| --------- | ----- | ----------------------------------- |
| `xs`      | 12px  | Extra small text (labels, captions) |
| `sm`      | 14px  | Small text (secondary info, dates)  |
| `base`    | 16px  | Base text (body text, buttons)      |
| `lg`      | 18px  | Large text (headings, welcome text) |
| `xl`      | 20px  | Extra large (section titles)        |
| `xxl`     | 24px  | Main headings, screen titles        |
| `xxxl`    | 28px  | App icons, large display text       |
| `display` | 32px  | Hero text, display purposes         |

## Font Weights

| Weight     | Value | Usage                         |
| ---------- | ----- | ----------------------------- |
| `normal`   | 400   | Regular body text             |
| `medium`   | 500   | Slightly emphasized text      |
| `semibold` | 600   | Important text, buttons       |
| `bold`     | 700   | Headings, very important text |

## Examples for Different Screens

### Screen Header

```typescript
const styles = StyleSheet.create({
  header: {
    ...textStyles.heading,
    color: theme.colors.text,
  },
});
```

### Button Text

```typescript
const styles = StyleSheet.create({
  primaryButton: {
    ...textStyles.button,
    color: '#ffffff',
  },
  secondaryButton: {
    ...textStyles.buttonSmall,
    color: theme.colors.primary,
  },
});
```

### Card Content

```typescript
const styles = StyleSheet.create({
  cardTitle: {
    ...textStyles.bodySemibold,
    color: theme.colors.text,
  },
  cardDescription: {
    ...textStyles.small,
    color: theme.colors.textSecondary,
  },
  cardLabel: {
    ...textStyles.caption,
    color: theme.colors.textSecondary,
  },
});
```

## Benefits

1. **Consistency**: All text looks uniform across the app
2. **Maintainability**: Change font sizes from one place
3. **Accessibility**: Proper text sizing and hierarchy
4. **Performance**: Optimized font loading and rendering
5. **Developer Experience**: Easy to use predefined styles

## Migration Guide

When updating existing screens:

1. Import the typography utilities
2. Replace hardcoded font sizes with textStyles
3. Remove duplicate font definitions
4. Test the visual appearance

Example migration:

```typescript
// Before
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
});

// After
const styles = StyleSheet.create({
  title: {
    ...textStyles.heading,
    color: theme.colors.text,
  },
});
```
