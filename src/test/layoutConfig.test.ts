import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadLayout, 
  saveLayout, 
  loadPanelVisibility, 
  savePanelVisibility,
  getPresetById,
  DEFAULT_PANELS,
  LAYOUT_PRESETS,
  STORAGE_KEYS
} from '../../lib/layoutConfig';

describe('Layout Configuration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('loadLayout', () => {
    it('should return default layout when no saved layout exists', () => {
      const result = loadLayout();
      expect(result).toBeDefined();
      expect(result.layout).toBeDefined();
      expect(Array.isArray(result.layout)).toBe(true);
    });

    it('should load saved layout from localStorage', () => {
      const mockLayout = [
        { i: 'chart', x: 0, y: 0, w: 8, h: 4 },
      ];
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(mockLayout));
      
      const result = loadLayout();
      expect(result.layout).toEqual(mockLayout);
    });

    it('should return default layout if localStorage data is invalid', () => {
      localStorage.setItem('dashboardLayout', 'invalid json');
      
      const result = loadLayout();
      expect(result.layout).toBeDefined();
      expect(Array.isArray(result.layout)).toBe(true);
    });
  });

  describe('saveLayout', () => {
    it('should save layout to localStorage', () => {
      const mockLayout = [
        { i: 'chart', x: 0, y: 0, w: 8, h: 4 },
      ];
      
      saveLayout(mockLayout);
      
      const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(mockLayout);
    });

    it('should save with preset ID', () => {
      const mockLayout = [
        { i: 'chart', x: 0, y: 0, w: 8, h: 4 },
      ];
      
      saveLayout(mockLayout, undefined, 'compact');
      
      const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(mockLayout);
    });
  });

  describe('loadPanelVisibility', () => {
    it('should return default panel visibility when no saved data exists', () => {
      const result = loadPanelVisibility();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should load saved panel visibility from localStorage', () => {
      const mockVisibility = {
        chart: true,
        marketData: false,
        aiFeed: true,
      };
      localStorage.setItem(STORAGE_KEYS.PANEL_VISIBILITY, JSON.stringify(mockVisibility));
      
      const result = loadPanelVisibility();
      expect(result).toEqual(mockVisibility);
    });
  });

  describe('savePanelVisibility', () => {
    it('should save panel visibility to localStorage', () => {
      const mockVisibility = {
        chart: true,
        'market-data': false,
        'ai-chat': true,
        'ai-feed': true,
        opportunities: true,
        performance: false,
      };
      
      savePanelVisibility(mockVisibility);
      
      const saved = localStorage.getItem(STORAGE_KEYS.PANEL_VISIBILITY);
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(mockVisibility);
    });
  });

  describe('getPresetById', () => {
    it('should return preset by ID', () => {
      const defaultPreset = getPresetById('balanced');
      expect(defaultPreset).toBeDefined();
      expect(defaultPreset?.id).toBe('balanced');
    });

    it('should return undefined for unknown preset ID', () => {
      const result = getPresetById('unknown-preset');
      expect(result).toBeUndefined();
    });
  });

  describe('DEFAULT_PANELS', () => {
    it('should have all required panel definitions', () => {
      expect(DEFAULT_PANELS.chart).toBeDefined();
      expect(DEFAULT_PANELS['market-data']).toBeDefined();
      expect(DEFAULT_PANELS['ai-feed']).toBeDefined();
      expect(DEFAULT_PANELS['ai-chat']).toBeDefined();
      expect(DEFAULT_PANELS.opportunities).toBeDefined();
    });

    it('should have valid panel properties', () => {
      Object.values(DEFAULT_PANELS).forEach(panel => {
        expect(panel.id).toBeDefined();
        expect(panel.title).toBeDefined();
        expect(typeof panel.visible).toBe('boolean');
      });
    });
  });

  describe('LAYOUT_PRESETS', () => {
    it('should have multiple presets defined', () => {
      expect(LAYOUT_PRESETS.length).toBeGreaterThan(0);
    });

    it('should have valid preset structures', () => {
      LAYOUT_PRESETS.forEach(preset => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(Array.isArray(preset.layout)).toBe(true);
      });
    });
  });
});
