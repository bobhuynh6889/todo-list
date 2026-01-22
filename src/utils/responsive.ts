import { Dimensions, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;

/**
 * Device type detection
 */
export const isTablet = SCREEN_WIDTH >= 768;
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Scaling functions based on device width
 * @param size The size to scale
 * @returns Scaled size based on screen width
 */
export const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  return size * ratio;
};

/**
 * Moderate scale - balanced scaling for fonts and elements
 * @param size The size to scale
 * @param factor Scaling factor (0-1), default 0.5
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Get responsive font size
 * Ensures minimum readable size and scales appropriately
 */
export const getFontSize = (size: number): number => {
  const scaled = moderateScale(size, 0.3);
  // Ensure minimum readable size
  return Math.max(scaled, isSmallDevice ? size * 0.9 : size);
};

/**
 * Get responsive spacing
 * Scales spacing based on device size
 */
export const getSpacing = (size: number): number => {
  if (isTablet) {
    return size * 1.25; // 25% more spacing on tablets
  }
  if (isSmallDevice) {
    return size * 0.85; // 15% less spacing on small devices
  }
  return scale(size);
};

/**
 * Get responsive border radius
 */
export const getBorderRadius = (size: number): number => {
  return moderateScale(size, 0.3);
};

/**
 * Get responsive icon size
 */
export const getIconSize = (size: number): number => {
  return moderateScale(size, 0.4);
};

/**
 * Touch target minimum size (44pt for iOS, 48dp for Android)
 */
export const TOUCH_TARGET_SIZE = isIOS ? 44 : 48;

/**
 * Responsive layout breakpoints
 */
export const breakpoints = {
  small: 375,    // iPhone SE, small phones
  medium: 414,   // Standard phones
  large: 768,    // Tablets (portrait)
  xlarge: 1024,  // Tablets (landscape)
};

/**
 * Get number of columns for grid layouts
 */
export const getNumColumns = (): number => {
  if (SCREEN_WIDTH >= breakpoints.xlarge) {
    return 3; // Large tablets in landscape
  }
  if (SCREEN_WIDTH >= breakpoints.large) {
    return 2; // Tablets in portrait or medium tablets in landscape
  }
  return 1; // Phones
};

/**
 * Responsive padding values
 */
export const padding = {
  xs: getSpacing(4),
  sm: getSpacing(8),
  md: getSpacing(12),
  lg: getSpacing(16),
  xl: getSpacing(20),
  xxl: getSpacing(24),
  xxxl: getSpacing(32),
};

/**
 * Responsive margin values
 */
export const margin = {
  xs: getSpacing(4),
  sm: getSpacing(8),
  md: getSpacing(12),
  lg: getSpacing(16),
  xl: getSpacing(20),
  xxl: getSpacing(24),
  xxxl: getSpacing(32),
};

/**
 * Responsive font sizes
 */
export const fontSize = {
  xs: getFontSize(10),
  sm: getFontSize(12),
  md: getFontSize(14),
  lg: getFontSize(16),
  xl: getFontSize(18),
  xxl: getFontSize(20),
  xxxl: getFontSize(24),
  title: getFontSize(28),
  hero: getFontSize(32),
};

/**
 * Responsive border radius values
 */
export const borderRadius = {
  xs: getBorderRadius(4),
  sm: getBorderRadius(6),
  md: getBorderRadius(8),
  lg: getBorderRadius(12),
  xl: getBorderRadius(16),
  full: 9999,
};

/**
 * Responsive icon sizes
 */
export const iconSize = {
  xs: getIconSize(16),
  sm: getIconSize(20),
  md: getIconSize(24),
  lg: getIconSize(28),
  xl: getIconSize(32),
};

/**
 * Platform-specific elevation/shadow
 */
export const getShadow = (elevation: number) => {
  if (isAndroid) {
    return {
      elevation,
    };
  }
  
  // iOS shadow
  const shadowOpacity = 0.1 + (elevation * 0.02);
  const shadowRadius = elevation * 0.8;
  const shadowOffset = {
    width: 0,
    height: elevation / 2,
  };
  
  return {
    shadowColor: '#000',
    shadowOffset,
    shadowOpacity: Math.min(shadowOpacity, 0.3),
    shadowRadius,
  };
};


export default {
  getShadow,
  getNumColumns,
  isTablet,
  isSmallDevice,
  isIOS,
  isAndroid,
  TOUCH_TARGET_SIZE,
  breakpoints,
  padding,
  margin,
  fontSize,
  borderRadius,
  iconSize,
};
