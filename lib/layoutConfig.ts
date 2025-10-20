import type { Layout } from 'react-grid-layout';

export type PanelId = 'chart' | 'ai-chat' | 'ai-feed' | 'market-data' | 'opportunities' | 'performance';

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
      { i: 'ai-feed', x: 0, y: 0, w: 3, h: 8, minW: 2, minH: 3 },
      { i: 'chart', x: 3, y: 0, w: 6, h: 8, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 4, w: 3, h: 4, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 8, w: 12, h: 5, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false
    }
  },
  {
    id: 'chart-first',
    name: 'Chart-First',
    description: 'Large chart with AI assistance on the side',
    icon: '📈',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 7, h: 8, minW: 4, minH: 4 },
      { i: 'ai-feed', x: 7, y: 0, w: 5, h: 8, minW: 2, minH: 3 },
      { i: 'market-data', x: 0, y: 8, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'opportunities', x: 3, y: 8, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 11, w: 12, h: 5, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Equal attention to chart, AI, and market data',
    icon: '⚖️',
    layout: [
      { i: 'ai-feed', x: 0, y: 0, w: 3, h: 8, minW: 2, minH: 3 },
      { i: 'chart', x: 3, y: 0, w: 6, h: 8, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 4, w: 3, h: 4, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 8, w: 12, h: 5, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean layout with essentials only',
    icon: '✨',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 8, h: 8, minW: 4, minH: 4 },
      { i: 'market-data', x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 8, y: 4, w: 4, h: 4, minW: 2, minH: 3 },
      { i: 'ai-feed', x: 0, y: 8, w: 12, h: 5, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': false,
      'performance': false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced layout with all panels visible',
    icon: '💼',
    layout: [
      { i: 'ai-feed', x: 0, y: 0, w: 2, h: 7, minW: 2, minH: 3 },
      { i: 'chart', x: 2, y: 0, w: 7, h: 9, minW: 4, minH: 4 },
      { i: 'market-data', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'opportunities', x: 9, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'performance', x: 9, y: 6, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 2, y: 9, w: 10, h: 4, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': true
    }
  },
  {
    id: 'learning',
    name: 'Learning Mode',
    description: 'Educational layout with chart analysis',
    icon: '📚',
    layout: [
      { i: 'chart', x: 0, y: 0, w: 7, h: 8, minW: 4, minH: 4 },
      { i: 'ai-feed', x: 7, y: 0, w: 5, h: 10, minW: 2, minH: 3 },
      { i: 'market-data', x: 0, y: 8, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'opportunities', x: 3, y: 8, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'ai-chat', x: 0, y: 10, w: 12, h: 4, minW: 3, minH: 3 }
    ],
    panelVisibility: {
      'chart': true,
      'ai-chat': true,
      'ai-feed': true,
      'market-data': true,
      'opportunities': true,
      'performance': false
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
