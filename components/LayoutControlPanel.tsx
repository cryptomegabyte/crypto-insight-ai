import { useState } from 'react';
import { LAYOUT_PRESETS, type LayoutPreset, type PanelId, DEFAULT_PANELS } from '../lib/layoutConfig';

interface LayoutControlPanelProps {
  currentPresetId?: string;
  onPresetChange: (preset: LayoutPreset) => void;
  panelVisibility: Record<PanelId, boolean>;
  onPanelVisibilityChange: (panelId: PanelId, visible: boolean) => void;
  onResetLayout: () => void;
}

export default function LayoutControlPanel({
  currentPresetId,
  onPresetChange,
  panelVisibility,
  onPanelVisibilityChange,
  onResetLayout
}: LayoutControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
        title="Layout Settings"
      >
        <span className="text-lg">⚙️</span>
        <span className="hidden sm:inline text-sm font-medium">Layout</span>
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] overflow-y-auto bg-gray-900 rounded-lg shadow-2xl border border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎨</span>
                Layout Settings
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Choose a preset or customize panels
              </p>
            </div>

            {/* Preset Layouts */}
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-3">Presets</h4>
              <div className="space-y-2">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onPresetChange(preset);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      currentPresetId === preset.id
                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{preset.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {preset.name}
                          </span>
                          {currentPresetId === preset.id && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Visibility */}
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-3">Show/Hide Panels</h4>
              <div className="space-y-2">
                {(Object.entries(DEFAULT_PANELS) as [PanelId, typeof DEFAULT_PANELS[PanelId]][]).map(([id, panel]) => (
                  <label
                    key={id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={panelVisibility[id]}
                      onChange={(e) => onPanelVisibilityChange(id, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-lg">{panel.icon}</span>
                    <span className="text-sm text-gray-300">{panel.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <button
                onClick={() => {
                  onResetLayout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                🔄 Reset to Default
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Drag panels to customize, or pick a preset
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
