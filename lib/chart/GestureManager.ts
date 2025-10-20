/**
 * Touch Gesture Handler
 * Handles pinch-to-zoom, pan, and tap gestures for mobile
 */

export interface GestureEvent {
  type: 'pan' | 'pinch' | 'tap' | 'longpress';
  x: number;
  y: number;
  scale?: number;
  deltaX?: number;
  deltaY?: number;
}

export type GestureHandler = (event: GestureEvent) => void;

export class TouchGestureManager {
  private element: HTMLElement;
  private handlers: Map<string, GestureHandler> = new Map();
  
  private touchState = {
    touches: [] as Touch[],
    initialDistance: 0,
    initialScale: 1,
    lastPanX: 0,
    lastPanY: 0,
    longPressTimer: null as number | null,
    tapTimer: null as number | null,
  };

  private readonly LONG_PRESS_DURATION = 500;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly MIN_PINCH_DISTANCE = 40;
  private readonly MIN_PAN_DISTANCE = 5;

  constructor(element: HTMLElement) {
    this.element = element;
    this.bindEvents();
  }

  private bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }

  public on(event: string, handler: GestureHandler) {
    this.handlers.set(event, handler);
  }

  public off(event: string) {
    this.handlers.delete(event);
  }

  private emit(event: GestureEvent) {
    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    
    this.touchState.touches = Array.from(e.touches);
    
    if (e.touches.length === 1) {
      // Single touch - possible tap or long press
      const touch = e.touches[0];
      this.touchState.lastPanX = touch.clientX;
      this.touchState.lastPanY = touch.clientY;
      
      // Start long press timer
      this.touchState.longPressTimer = window.setTimeout(() => {
        this.emit({
          type: 'longpress',
          x: touch.clientX,
          y: touch.clientY,
        });
      }, this.LONG_PRESS_DURATION);
      
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      this.clearTimers();
      
      const distance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.touchState.initialDistance = distance;
      this.touchState.initialScale = 1;
    }
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    
    this.clearTimers();
    
    if (e.touches.length === 1) {
      // Single touch - pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchState.lastPanX;
      const deltaY = touch.clientY - this.touchState.lastPanY;
      
      // Only emit pan if movement is significant
      if (Math.abs(deltaX) > this.MIN_PAN_DISTANCE || Math.abs(deltaY) > this.MIN_PAN_DISTANCE) {
        this.emit({
          type: 'pan',
          x: touch.clientX,
          y: touch.clientY,
          deltaX,
          deltaY,
        });
        
        this.touchState.lastPanX = touch.clientX;
        this.touchState.lastPanY = touch.clientY;
      }
      
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const distance = this.getTouchDistance(e.touches[0], e.touches[1]);
      
      if (this.touchState.initialDistance > this.MIN_PINCH_DISTANCE) {
        const scale = distance / this.touchState.initialDistance;
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        this.emit({
          type: 'pinch',
          x: centerX,
          y: centerY,
          scale,
        });
      }
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    
    const hadOneFinger = this.touchState.touches.length === 1;
    const hadTwoFingers = this.touchState.touches.length === 2;
    
    this.touchState.touches = Array.from(e.touches);
    
    // Handle tap
    if (hadOneFinger && e.touches.length === 0 && this.touchState.longPressTimer) {
      const touch = e.changedTouches[0];
      this.clearTimers();
      
      this.emit({
        type: 'tap',
        x: touch.clientX,
        y: touch.clientY,
      });
    }
    
    // Reset pinch state when releasing second finger
    if (hadTwoFingers && e.touches.length === 1) {
      this.touchState.initialDistance = 0;
      this.touchState.initialScale = 1;
    }
    
    this.clearTimers();
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private clearTimers() {
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
      this.touchState.longPressTimer = null;
    }
    
    if (this.touchState.tapTimer) {
      clearTimeout(this.touchState.tapTimer);
      this.touchState.tapTimer = null;
    }
  }

  public destroy() {
    this.clearTimers();
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }
}

/**
 * Mouse Gesture Handler
 * Handles mouse interactions for desktop
 */
export class MouseGestureManager {
  private element: HTMLElement;
  private handlers: Map<string, GestureHandler> = new Map();
  
  private mouseState = {
    isDown: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.bindEvents();
  }

  private bindEvents() {
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  public on(event: string, handler: GestureHandler) {
    this.handlers.set(event, handler);
  }

  public off(event: string) {
    this.handlers.delete(event);
  }

  private emit(event: GestureEvent) {
    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  private handleMouseDown(e: MouseEvent) {
    this.mouseState.isDown = true;
    this.mouseState.dragStartX = e.clientX;
    this.mouseState.dragStartY = e.clientY;
    this.mouseState.lastX = e.clientX;
    this.mouseState.lastY = e.clientY;
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.mouseState.isDown) {
      const deltaX = e.clientX - this.mouseState.lastX;
      const deltaY = e.clientY - this.mouseState.lastY;
      
      this.emit({
        type: 'pan',
        x: e.clientX,
        y: e.clientY,
        deltaX,
        deltaY,
      });
      
      this.mouseState.lastX = e.clientX;
      this.mouseState.lastY = e.clientY;
    }
  }

  private handleMouseUp(e: MouseEvent) {
    this.mouseState.isDown = false;
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    
    // Zoom with mouse wheel
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    
    this.emit({
      type: 'pinch',
      x: e.clientX,
      y: e.clientY,
      scale,
    });
  }

  private handleClick(e: MouseEvent) {
    this.emit({
      type: 'tap',
      x: e.clientX,
      y: e.clientY,
    });
  }

  public destroy() {
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
    this.element.removeEventListener('wheel', this.handleWheel.bind(this));
    this.element.removeEventListener('click', this.handleClick.bind(this));
  }
}
