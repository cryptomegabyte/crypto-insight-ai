import React from 'react';
import type { AnnotationType } from '../lib/chartAnnotations';
import { ANNOTATION_COLORS } from '../lib/chartAnnotations';

interface DrawingToolbarProps {
  activeTool: AnnotationType | null;
  onSelectTool: (tool: AnnotationType | null) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onClearAll: () => void;
  annotationCount: number;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedColor,
  onSelectColor,
  onClearAll,
  annotationCount
}) => {
  const tools: { type: AnnotationType | null; icon: string; label: string }[] = [
    { type: null, icon: '👆', label: 'Select' },
    { type: 'trendline', icon: '📈', label: 'Trend Line' },
    { type: 'horizontal', icon: '➖', label: 'Horizontal' },
    { type: 'vertical', icon: '|', label: 'Vertical' },
    { type: 'rectangle', icon: '▭', label: 'Rectangle' },
    { type: 'fibonacci', icon: '🔢', label: 'Fibonacci' },
  ];

  return (
    <div className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-wrap gap-1 max-w-md">
      {/* Drawing Tools */}
      <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            onClick={() => onSelectTool(tool.type)}
            className={`p-2 rounded-md transition-colors text-sm font-medium ${
              activeTool === tool.type
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={tool.label}
          >
            <span className="block text-center">{tool.icon}</span>
          </button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
        {ANNOTATION_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`w-8 h-8 rounded-md border-2 transition-all ${
              selectedColor === color
                ? 'border-gray-800 dark:border-white scale-110'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1 items-center">
        <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
          {annotationCount} {annotationCount === 1 ? 'drawing' : 'drawings'}
        </span>
        <button
          onClick={onClearAll}
          disabled={annotationCount === 0}
          className="px-3 py-2 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear All Drawings"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingToolbar;
