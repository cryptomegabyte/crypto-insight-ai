/**
 * High-Performance Chart Engine
 * Uses layered canvas approach for optimal rendering
 */

import type { OhlcvData } from '../../types';
import { DrawingManager } from './DrawingTools';
import { TouchGestureManager, MouseGestureManager, type GestureEvent } from './GestureManager';

export interface ChartPoint {
  x: number;
  y: number;
  timestamp: number;
  price: number;
}

interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
  width: number;
  height: number;
}

interface DirtyFlags {
  background: boolean;
  grid: boolean;
  candles: boolean;
  indicators: boolean;
  drawings: boolean;
  crosshair: boolean;
}

type LayerName = keyof DirtyFlags;

export class ChartEngine {
  private container: HTMLElement;
  private layers: Map<LayerName, HTMLCanvasElement> = new Map();
  private contexts: Map<LayerName, CanvasRenderingContext2D> = new Map();
  
  private candles: OhlcvData[] = [];
  private viewport: ViewportState = {
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    width: 0,
    height: 0,
  };

  private dirtyLayers: DirtyFlags = {
    background: true,
    grid: true,
    candles: true,
    indicators: true,
    drawings: true,
    crosshair: true,
  };

  private rafId: number | null = null;
  private lastRenderTime = 0;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;

  // Integrated drawing manager
  public drawingManager: DrawingManager;
  
  // Gesture managers
  private touchGesture: TouchGestureManager | null = null;
  private mouseGesture: MouseGestureManager | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.drawingManager = new DrawingManager();
    this.initializeLayers();
    this.bindGestures();
  }

  private bindGestures() {
    // Initialize touch gestures
    this.touchGesture = new TouchGestureManager(this.container);
    this.touchGesture.on('pan', this.handlePan.bind(this));
    this.touchGesture.on('pinch', this.handlePinch.bind(this));
    this.touchGesture.on('tap', this.handleTap.bind(this));
    
    // Initialize mouse gestures
    this.mouseGesture = new MouseGestureManager(this.container);
    this.mouseGesture.on('pan', this.handlePan.bind(this));
    this.mouseGesture.on('pinch', this.handlePinch.bind(this));
    this.mouseGesture.on('tap', this.handleTap.bind(this));
  }

  private handlePan(event: GestureEvent) {
    if (event.deltaX && event.deltaY) {
      this.viewport.offsetX += event.deltaX;
      this.viewport.offsetY += event.deltaY;
      this.dirtyLayers.grid = true;
      this.dirtyLayers.candles = true;
      this.dirtyLayers.indicators = true;
      this.dirtyLayers.drawings = true;
      this.scheduleRender();
    }
  }

  private handlePinch(event: GestureEvent) {
    if (event.scale) {
      this.viewport.zoom *= event.scale;
      this.viewport.zoom = Math.max(0.1, Math.min(10, this.viewport.zoom));
      this.dirtyLayers.grid = true;
      this.dirtyLayers.candles = true;
      this.dirtyLayers.indicators = true;
      this.dirtyLayers.drawings = true;
      this.scheduleRender();
    }
  }

  private handleTap(event: GestureEvent) {
    // Convert screen coordinates to chart coordinates
    const point = {
      x: event.x,
      y: event.y,
      price: this.screenToPrice(event.y),
      time: this.screenToTime(event.x),
    };
    
    // If actively drawing, add point
    if (this.drawingManager.getActiveTool()) {
      this.drawingManager.addPoint(point);
      this.dirtyLayers.drawings = true;
      this.scheduleRender();
    } else {
      // Otherwise try to select a drawing
      this.drawingManager.selectDrawing(point, 10);
      this.dirtyLayers.drawings = true;
      this.scheduleRender();
    }
  }

  private screenToPrice(y: number): number {
    // TODO: Implement based on viewport and candle data
    return 0;
  }

  private screenToTime(x: number): number {
    // TODO: Implement based on viewport and candle data
    return 0;
  }

  private initializeLayers() {
    const layerNames: LayerName[] = [
      'background',
      'grid',
      'candles',
      'indicators',
      'drawings',
      'crosshair',
    ];

    layerNames.forEach((name, index) => {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.zIndex = String(index);
      canvas.style.pointerEvents = index === layerNames.length - 1 ? 'auto' : 'none';
      
      this.container.appendChild(canvas);
      this.layers.set(name, canvas);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.contexts.set(name, ctx);
      }
    });
  }

  public resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    
    Object.values(this.layers).forEach(canvas => {
      if (!canvas) return;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    });

    this.viewport.width = width;
    this.viewport.height = height;
    this.markAllDirty();
  }

  public setData(candles: OhlcvData[]) {
    this.candles = candles;
    this.dirtyLayers.candles = true;
    this.dirtyLayers.indicators = true;
    this.scheduleRender();
  }

  public updateViewport(updates: Partial<ViewportState>) {
    Object.assign(this.viewport, updates);
    this.dirtyLayers.grid = true;
    this.dirtyLayers.candles = true;
    this.dirtyLayers.indicators = true;
    this.dirtyLayers.drawings = true;
    this.scheduleRender();
  }

  private markAllDirty() {
    Object.keys(this.dirtyLayers).forEach(key => {
      this.dirtyLayers[key as keyof typeof this.dirtyLayers] = true;
    });
  }

  private scheduleRender() {
    if (this.rafId !== null) return;
    
    this.rafId = requestAnimationFrame((timestamp) => {
      this.rafId = null;
      
      // Throttle to target FPS
      if (timestamp - this.lastRenderTime >= this.FRAME_TIME) {
        this.render();
        this.lastRenderTime = timestamp;
      } else {
        this.scheduleRender();
      }
    });
  }

  private render() {
    // Only render dirty layers
    if (this.dirtyLayers.background) {
      this.renderBackground();
      this.dirtyLayers.background = false;
    }
    
    if (this.dirtyLayers.grid) {
      this.renderGrid();
      this.dirtyLayers.grid = false;
    }
    
    if (this.dirtyLayers.candles) {
      this.renderCandles();
      this.dirtyLayers.candles = false;
    }
    
    if (this.dirtyLayers.indicators) {
      this.renderIndicators();
      this.dirtyLayers.indicators = false;
    }
    
    if (this.dirtyLayers.drawings) {
      this.renderDrawings();
      this.dirtyLayers.drawings = false;
    }
    
    if (this.dirtyLayers.crosshair) {
      this.renderCrosshair();
      this.dirtyLayers.crosshair = false;
    }
  }

  private renderBackground() {
    const canvas = this.layers.get('background');
    if (!canvas) return;
    
    const ctx = this.contexts.get('background');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);
  }

  private renderGrid() {
    const canvas = this.layers.get('grid');
    if (!canvas) return;
    
    const ctx = this.contexts.get('grid');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical lines
    const gridSpacing = 100 * this.viewport.zoom;
    for (let x = 0; x < this.viewport.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.viewport.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.viewport.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.viewport.width, y);
      ctx.stroke();
    }
  }

  private renderCandles() {
    const canvas = this.layers.get('candles');
    if (!canvas) return;
    
    const ctx = this.contexts.get('candles');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

    // Calculate visible range
    const candleWidth = 8 * this.viewport.zoom;
    const visibleCount = Math.ceil(this.viewport.width / candleWidth);
    const startIndex = Math.max(0, Math.floor(this.viewport.offsetX / candleWidth));
    const endIndex = Math.min(this.candles.length, startIndex + visibleCount);

    // Get price range for visible candles
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    for (let i = startIndex; i < endIndex; i++) {
      const candle = this.candles[i];
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    }

    const priceRange = maxPrice - minPrice;
    const priceToY = (price: number) => 
      this.viewport.height * (1 - (price - minPrice) / priceRange);

    // Render candles with viewport culling
    for (let i = startIndex; i < endIndex; i++) {
      const candle = this.candles[i];
      const x = (i - startIndex) * candleWidth;
      
      const isUp = candle.close >= candle.open;
      ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
      ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';

      // Draw wick
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      ctx.fillRect(x + 1, bodyY, candleWidth - 2, Math.max(1, bodyHeight));
    }
  }

  private renderIndicators() {
    // Placeholder for indicator rendering
    const canvas = this.layers.get('indicators');
    if (!canvas) return;
    
    const ctx = this.contexts.get('indicators');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
  }

  private renderDrawings() {
    const canvas = this.layers.get('drawings');
    if (!canvas) return;
    
    const ctx = this.contexts.get('drawings');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
    
    // Render all drawings from drawing manager
    this.drawingManager.render(ctx);
  }

  private renderCrosshair() {
    // Placeholder for crosshair
    const canvas = this.layers.get('crosshair');
    if (!canvas) return;
    
    const ctx = this.contexts.get('crosshair');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
  }

  public destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Clean up gesture managers
    this.touchGesture?.destroy();
    this.mouseGesture?.destroy();
    
    // Remove all canvas elements
    this.layers.forEach(canvas => {
      canvas.remove();
    });
    
    this.layers.clear();
    this.contexts.clear();
  }
}
