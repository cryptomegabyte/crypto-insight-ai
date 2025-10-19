export type AnnotationType = 
  | 'trendline' 
  | 'horizontal' 
  | 'vertical' 
  | 'rectangle' 
  | 'fibonacci' 
  | 'text';

export interface Point {
  x: number;
  y: number;
  price?: number;
  time?: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  points: Point[];
  color: string;
  label?: string;
  lineWidth?: number;
  completed: boolean;
}

export interface FibonacciLevels {
  levels: number[];
  labels: string[];
}

export const FIBONACCI_LEVELS: FibonacciLevels = {
  levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
  labels: ['0%', '23.6%', '38.2%', '50%', '61.8%', '78.6%', '100%']
};

export const ANNOTATION_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export class AnnotationManager {
  private annotations: Annotation[] = [];
  private activeAnnotation: Annotation | null = null;
  private selectedColor: string = ANNOTATION_COLORS[0];
  private nextId = 1;

  getAnnotations(): Annotation[] {
    return this.annotations;
  }

  getActiveAnnotation(): Annotation | null {
    return this.activeAnnotation;
  }

  setSelectedColor(color: string) {
    this.selectedColor = color;
  }

  getSelectedColor(): string {
    return this.selectedColor;
  }

  startAnnotation(type: AnnotationType, point: Point): Annotation {
    const annotation: Annotation = {
      id: `annotation-${this.nextId++}`,
      type,
      points: [point],
      color: this.selectedColor,
      lineWidth: 2,
      completed: false
    };
    this.activeAnnotation = annotation;
    return annotation;
  }

  updateActiveAnnotation(point: Point) {
    if (!this.activeAnnotation) return;

    if (this.activeAnnotation.type === 'trendline' || 
        this.activeAnnotation.type === 'horizontal' ||
        this.activeAnnotation.type === 'vertical' ||
        this.activeAnnotation.type === 'fibonacci') {
      // Two-point annotations
      if (this.activeAnnotation.points.length === 1) {
        this.activeAnnotation.points.push(point);
      } else {
        this.activeAnnotation.points[1] = point;
      }
    } else if (this.activeAnnotation.type === 'rectangle') {
      // Rectangle uses two opposite corners
      if (this.activeAnnotation.points.length === 1) {
        this.activeAnnotation.points.push(point);
      } else {
        this.activeAnnotation.points[1] = point;
      }
    }
  }

  completeAnnotation() {
    if (!this.activeAnnotation) return;

    // Only save if we have enough points
    if (this.activeAnnotation.points.length >= 2 || this.activeAnnotation.type === 'text') {
      this.activeAnnotation.completed = true;
      this.annotations.push(this.activeAnnotation);
    }
    this.activeAnnotation = null;
  }

  cancelAnnotation() {
    this.activeAnnotation = null;
  }

  deleteAnnotation(id: string) {
    this.annotations = this.annotations.filter(a => a.id !== id);
  }

  findAnnotationAt(point: Point, tolerance: number = 10): Annotation | null {
    // Find annotation near the click point
    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const annotation = this.annotations[i];
      
      if (this.isPointNearAnnotation(point, annotation, tolerance)) {
        return annotation;
      }
    }
    return null;
  }

  private isPointNearAnnotation(point: Point, annotation: Annotation, tolerance: number): boolean {
    if (annotation.type === 'trendline' || annotation.type === 'horizontal' || annotation.type === 'vertical') {
      return this.isPointNearLine(point, annotation.points[0], annotation.points[1], tolerance);
    } else if (annotation.type === 'rectangle') {
      return this.isPointInRectangle(point, annotation.points[0], annotation.points[1], tolerance);
    } else if (annotation.type === 'fibonacci') {
      // Check if near any Fibonacci level line
      const p1 = annotation.points[0];
      const p2 = annotation.points[1];
      for (const level of FIBONACCI_LEVELS.levels) {
        const levelY = p1.y + (p2.y - p1.y) * level;
        const levelPoint = { x: p1.x, y: levelY };
        if (this.isPointNearLine(point, levelPoint, { x: p2.x, y: levelY }, tolerance)) {
          return true;
        }
      }
    }
    return false;
  }

  private isPointNearLine(point: Point, p1: Point, p2: Point, tolerance: number): boolean {
    const distance = this.pointToLineDistance(point, p1, p2);
    return distance <= tolerance;
  }

  private pointToLineDistance(point: Point, p1: Point, p2: Point): number {
    const A = point.x - p1.x;
    const B = point.y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = p1.x;
      yy = p1.y;
    } else if (param > 1) {
      xx = p2.x;
      yy = p2.y;
    } else {
      xx = p1.x + param * C;
      yy = p1.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private isPointInRectangle(point: Point, p1: Point, p2: Point, tolerance: number): boolean {
    const minX = Math.min(p1.x, p2.x) - tolerance;
    const maxX = Math.max(p1.x, p2.x) + tolerance;
    const minY = Math.min(p1.y, p2.y) - tolerance;
    const maxY = Math.max(p1.y, p2.y) + tolerance;

    // Check if on border
    const onBorder = (
      (Math.abs(point.x - minX) <= tolerance || Math.abs(point.x - maxX) <= tolerance) &&
      point.y >= minY && point.y <= maxY
    ) || (
      (Math.abs(point.y - minY) <= tolerance || Math.abs(point.y - maxY) <= tolerance) &&
      point.x >= minX && point.x <= maxX
    );

    return onBorder;
  }

  clearAll() {
    this.annotations = [];
    this.activeAnnotation = null;
  }

  exportAnnotations(): string {
    return JSON.stringify(this.annotations);
  }

  importAnnotations(json: string) {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.annotations = imported;
      }
    } catch (e) {
      console.error('Failed to import annotations:', e);
    }
  }
}

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  priceToY: (price: number) => number,
  timeToX: (time: number) => number
) => {
  ctx.save();
  ctx.strokeStyle = annotation.color;
  ctx.lineWidth = annotation.lineWidth || 2;
  ctx.globalAlpha = annotation.completed ? 1 : 0.7;

  const points = annotation.points;

  switch (annotation.type) {
    case 'trendline':
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        
        // Draw handles
        drawHandle(ctx, points[0].x, points[0].y, annotation.color);
        drawHandle(ctx, points[1].x, points[1].y, annotation.color);
      }
      break;

    case 'horizontal':
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[0].y); // Keep Y the same
        ctx.stroke();
        
        // Price label
        if (points[0].price !== undefined) {
          ctx.fillStyle = annotation.color;
          ctx.fillText(points[0].price.toFixed(2), points[1].x + 5, points[0].y - 5);
        }
      }
      break;

    case 'vertical':
      if (points.length >= 2) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[0].x, points[1].y); // Keep X the same
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;

    case 'rectangle':
      if (points.length >= 2) {
        const width = points[1].x - points[0].x;
        const height = points[1].y - points[0].y;
        ctx.fillStyle = annotation.color + '20'; // Add transparency
        ctx.fillRect(points[0].x, points[0].y, width, height);
        ctx.strokeRect(points[0].x, points[0].y, width, height);
      }
      break;

    case 'fibonacci':
      if (points.length >= 2) {
        const p1 = points[0];
        const p2 = points[1];
        const width = p2.x - p1.x;

        FIBONACCI_LEVELS.levels.forEach((level, i) => {
          const y = p1.y + (p2.y - p1.y) * level;
          
          // Line
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = annotation.color + '20';
          const nextLevel = FIBONACCI_LEVELS.levels[i + 1] || 1;
          const nextY = p1.y + (p2.y - p1.y) * nextLevel;
          ctx.fillRect(p1.x, y, width, nextY - y);
          
          ctx.globalAlpha = annotation.completed ? 0.8 : 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, y);
          ctx.lineTo(p2.x, y);
          ctx.stroke();

          // Label
          ctx.fillStyle = annotation.color;
          ctx.font = '12px sans-serif';
          ctx.fillText(FIBONACCI_LEVELS.labels[i], p2.x + 5, y + 4);
        });
      }
      break;

    case 'text':
      if (points.length >= 1 && annotation.label) {
        ctx.fillStyle = annotation.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(annotation.label, points[0].x, points[0].y);
      }
      break;
  }

  ctx.restore();
};

const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};
