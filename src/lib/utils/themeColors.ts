/**
 * Theme color constants for SuliExpo application
 * Use these colors consistently across the application for UI elements
 */

export const THEME_COLORS = {
  // Background colors
  LIGHT: {
    BACKGROUND: '#FFFFFF',  // White
    TABLE_HEADER: '#e9ecefd2',
    TABLE_CELL: 'bg-gray-50',
    NAVBAR: '#FFFFFF'
  },
  DARK: {
    BACKGROUND: '#222831',  // Dark blue-gray
    TABLE_HEADER: '#2c333d', // Darker header
    TABLE_CELL: '#323a45',   // Slightly lighter than header
    NAVBAR: '#2c333d'        // Match header for consistency
  },
  
  // Text colors
  TEXT: {
    LIGHT: '#4b5563',
    DARK: '#d1d5db',
    ACTIVE: '#E5B167'  // Gold accent color
  },
  
  // Border colors
  BORDER: {
    LIGHT: '#E2E8F0', 
    DARK: '#1a1f25'  // Very dark for subtle borders
  }
};

/**
 * Usage:
 * 
 * Import this file:
 * import { THEME_COLORS } from '$lib/utils/themeColors';
 * 
 * Then use in your components/styles:
 * <div class="bg-white dark:bg-[#222831]">...</div>
 * 
 * Or in JavaScript/TypeScript:
 * const bgColor = darkMode ? THEME_COLORS.DARK.BACKGROUND : THEME_COLORS.LIGHT.BACKGROUND;
 */ 