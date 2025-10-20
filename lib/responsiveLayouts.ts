import type { Layout, Layouts } from 'react-grid-layout';
import type { PanelId } from './layoutConfig';

/**
 * Responsive Breakpoints:
 * - lg: 1200px+ (Desktop)
 * - md: 996px-1199px (Tablet Landscape)
 * - sm: 768px-995px (Tablet Portrait)
 * - xs: 480px-767px (Mobile Landscape)
 * - xxs: <480px (Mobile Portrait)
 */

export const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

export const COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

export const ROW_HEIGHTS = {
  lg: 80,
  md: 80,
  sm: 70,
  xs: 60,
  xxs: 60
};

/**
 * Generate mobile-optimized layout from desktop layout
 * Mobile layouts stack vertically with full width
 */
export function generateMobileLayout(desktopLayout: Layout[]): Layout[] {
  return desktopLayout.map((item, index) => {
    // Mobile: stack vertically, full width, reduced height
    return {
      ...item,
      x: 0,
      y: index * 4, // Stack with 4-unit spacing
      w: 2, // Full width on mobile (2 cols out of 2)
      h: getMobileHeight(item.i as PanelId),
      minW: 2,
      minH: 2
    };
  });
}

/**
 * Generate tablet layout from desktop layout
 * Tablet layouts use simplified 2-column grid
 */
export function generateTabletLayout(desktopLayout: Layout[], isPortrait: boolean = true): Layout[] {
  const cols = isPortrait ? 6 : 10;
  
  return desktopLayout.map((item, index) => {
    const panelId = item.i as PanelId;
    
    if (isPortrait) {
      // Tablet Portrait: 6 cols - mostly full width or half width
      if (panelId === 'chart' || panelId === 'ai-chat') {
        return { ...item, x: 0, y: index * 5, w: 6, h: 5, minW: 4, minH: 4 };
      }
      // Smaller panels go side by side
      const isEven = index % 2 === 0;
      return { ...item, x: isEven ? 0 : 3, y: Math.floor(index / 2) * 3, w: 3, h: 3, minW: 2, minH: 2 };
    } else {
      // Tablet Landscape: 10 cols - more desktop-like
      if (panelId === 'chart') {
        return { ...item, x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 };
      }
      if (panelId === 'ai-chat') {
        return { ...item, x: 0, y: 10, w: 10, h: 4, minW: 3, minH: 3 };
      }
      // Side panels
      return { ...item, x: 6, y: (index - 2) * 3, w: 4, h: 3, minW: 2, minH: 2 };
    }
  });
}

/**
 * Get optimal mobile height for each panel type
 */
function getMobileHeight(panelId: PanelId): number {
  const heights: Record<PanelId, number> = {
    'chart': 6, // Chart needs more height
    'ai-chat': 6, // Chat needs space for conversation
    'ai-feed': 5, // Feed needs scrollable space
    'market-data': 3, // Compact data view
    'opportunities': 4, // List view
    'performance': 3 // Charts and metrics
  };
  return heights[panelId] || 4;
}

/**
 * Convert a desktop layout preset to responsive layouts for all breakpoints
 */
export function createResponsiveLayouts(desktopLayout: Layout[]): Layouts {
  return {
    lg: desktopLayout, // Desktop - original layout
    md: generateTabletLayout(desktopLayout, false), // Tablet Landscape
    sm: generateTabletLayout(desktopLayout, true), // Tablet Portrait
    xs: generateMobileLayout(desktopLayout), // Mobile Landscape - stacked
    xxs: generateMobileLayout(desktopLayout) // Mobile Portrait - stacked
  };
}

/**
 * Generate responsive layouts for all presets
 */
export function getResponsivePresetLayouts(presetLayout: Layout[]): Layouts {
  return createResponsiveLayouts(presetLayout);
}
