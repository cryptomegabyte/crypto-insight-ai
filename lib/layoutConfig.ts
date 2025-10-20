import type { Layout } from 'react-grid-layout';

export type PanelId = 'chart' | 'ai-chat' | 'ai-feed' | 'market-data' | 'opportunities' | 'performance' | 'ai-summary';

export interface PanelConfig {
  id: PanelId;
  title: string;
  icon: string;
  visible: boolean;
  minW?: number;
  minH?: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout: Layout[];
  panelVisibility: Record<PanelId, boolean>;
}

// Default panel configurations
export const DEFAULT_PANELS: Record<PanelId, PanelConfig> = {
  'chart': {
    id: 'chart',
    title: 'Chart',
    icon: '📈',
    visible: true,
    minW: 4,
    minH: 4
  },
  'ai-chat': {
    id: 'ai-chat',
    title: 'AI Assistant',
    icon: '🤖',
    visible: true,
    minW: 3,
    minH: 3
  },
  'ai-feed': {
    id: 'ai-feed',
    title: 'AI Feed',
    icon: '📡',
    visible: true,
    minW: 2,
    minH: 3
  },
  'market-data': {
    id: 'market-data',
    title: 'Market Data',
    icon: '💹',
    visible: true,
    minW: 2,
    minH: 2
  },
  'opportunities': {
    id: 'opportunities',
    title: 'Opportunities',
    icon: '🎯',
    visible: true,
    minW: 2,
    minH: 2
  },
  'performance': {
    id: 'performance',
    title: 'Performance',
    icon: '📊',
    visible: false,
    minW: 2,
    minH: 2
  },
  'ai-summary': {
    id: 'ai-summary',
    title: 'Chart Summary',
    icon: '📝',
    visible: false,
    minW: 2,
    minH: 2
  }
};

// Layout Presets
export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'ai-first',
    name: 'AI-First',
    description: 'Large AI panels with smaller chart - perfect for AI-guided trading',
    icon: '🤖',
    layout: [
      { i: 'ai-feed', x: 0, y: 0, w: 3, h: 6, minW: 2, minH: 3 },
      { i: 'chart', x: 3, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 6, w: 12, h: 4, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false,
      'ai-summary': false
    }
  },
  {
    id: 'chart-first',
    name: 'Chart-First',
    description: 'Full-screen chart focus with collapsible AI sidebars',
    icon: '📈',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 9, h: 8, minW: 4, minH: 4 },
      { i: 'ai-feed', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
      { i: 'market-data', x: 9, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 6, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 8, w: 9, h: 3, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false,
      'ai-summary': false
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Equal attention to chart, AI, and market data',
    icon: '⚖️',
    layout: [
      { i: 'ai-feed', x: 0, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
      { i: 'chart', x: 3, y: 0, w: 6, h: 7, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 3, w: 3, h: 4, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 5, w: 3, h: 5, minW: 3, minH: 3 },
      { i: 'ai-summary', x: 3, y: 7, w: 6, h: 3, minW: 2, minH: 2 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false,
      'ai-summary': true
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Only chart and AI chat - distraction-free trading',
    icon: '✨',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 12, h: 7, minW: 4, minH: 4 },
      { i: 'ai-chat', x: 0, y: 7, w: 12, h: 4, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': false,
      'market-data': false,
      'opportunities': false,
      'performance': false,
      'ai-summary': false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced layout with all panels visible',
    icon: '💼',
    layout: [
      { i: 'ai-feed', x: 0, y: 0, w: 2, h: 5, minW: 2, minH: 3 },
      { i: 'chart', x: 2, y: 0, w: 7, h: 7, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 3, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'performance', x: 9, y: 5, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'ai-summary', x: 2, y: 7, w: 4, h: 3, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 5, w: 2, h: 5, minW: 3, minH: 3 },
      { i: 'ai-chat', x: 6, y: 7, w: 3, h: 3, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': true,
      'ai-summary': true
    }
  },
  {
    id: 'learning',
    name: 'Learning Mode',
    description: 'Emphasizes AI education and chart analysis',
    icon: '🎓',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
      { i: 'ai-feed', x: 6, y: 0, w: 3, h: 6, minW: 2, minH: 3 },
      { i: 'ai-summary', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'market-data', x: 9, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 6, w: 9, h: 4, minW: 3, minH: 3 },
      { i: 'opportunities', x: 9, y: 6, w: 3, h: 4, minW: 2, minH: 2 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false,
      'ai-summary': true
    }
  }
];

// Mobile-specific layout
export const MOBILE_LAYOUT: Layout[] = [
  { i: 'chart', x: 0, y: 0, w: 12, h: 4, minW: 12, minH: 3 },
  { i: 'ai-feed', x: 0, y: 4, w: 12, h: 3, minW: 12, minH: 2 },
  { i: 'market-data', x: 0, y: 7, w: 6, h: 2, minW: 6, minH: 2 },
  { i: 'opportunities', x: 6, y: 7, w: 6, h: 2, minW: 6, minH: 2 },
  { i: 'ai-chat', x: 0, y: 9, w: 12, h: 4, minW: 12, minH: 3 }
];

// Local storage keys
export const STORAGE_KEYS = {
  LAYOUT: 'crypto-insight-layout',
  PRESET: 'crypto-insight-preset',
  PANEL_VISIBILITY: 'crypto-insight-panel-visibility',
  CUSTOM_LAYOUT: 'crypto-insight-custom-layout'
};

// Helper functions
export function saveLayout(layout: Layout[], presetId?: string) {
  localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout));
  if (presetId) {
    localStorage.setItem(STORAGE_KEYS.PRESET, presetId);
  }
}

export function loadLayout(): { layout: Layout[]; presetId?: string } {
  const savedLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT);
  const savedPreset = localStorage.getItem(STORAGE_KEYS.PRESET);
  
  if (savedLayout) {
    return {
      layout: JSON.parse(savedLayout),
      presetId: savedPreset || undefined
    };
  }
  
  // Default to balanced layout
  return {
    layout: LAYOUT_PRESETS.find(p => p.id === 'balanced')!.layout,
    presetId: 'balanced'
  };
}

export function savePanelVisibility(visibility: Record<PanelId, boolean>) {
  localStorage.setItem(STORAGE_KEYS.PANEL_VISIBILITY, JSON.stringify(visibility));
}

export function loadPanelVisibility(): Record<PanelId, boolean> | null {
  const saved = localStorage.getItem(STORAGE_KEYS.PANEL_VISIBILITY);
  return saved ? JSON.parse(saved) : null;
}

export function getPresetById(id: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find(p => p.id === id);
}
