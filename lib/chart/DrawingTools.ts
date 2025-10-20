/**
 * Drawing Tools System
 * Modular architecture for chart annotations
 */

export interface Point {
  x: number;
  y: number;
  price?: number;
  time?: number;
}

export interface DrawingStyle {
  color: string;
  lineWidth: number;
  lineDash?: number[];
  fillOpacity?: number;
}

export abstract class DrawingTool {
  public id: string;
  public type: string;
  public points: Point[] = [];
  public style: DrawingStyle;
  public isComplete = false;
  public isSelected = false;

  constructor(type: string, style: DrawingStyle) {
    this.id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.style = style;
  }

  abstract get requiredPoints(): number;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract hitTest(point: Point, tolerance: number): boolean;
  abstract move(dx: number, dy: number): void;

  public addPoint(point: Point): boolean {
    if (this.isComplete) return false;
    
    this.points.push(point);
    
    if (this.points.length >= this.requiredPoints) {
      this.isComplete = true;
    }
    
    return true;
  }

  public updateLastPoint(point: Point) {
    if (this.points.length > 0) {
      this.points[this.points.length - 1] = point;
    }
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      points: this.points,
      style: this.style,
      isComplete: this.isComplete,
    };
  }
}

export class TrendLine extends DrawingTool {
  constructor(style: DrawingStyle) {
    super('trendline', style);
  }

  get requiredPoints() {
    return 2;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = this.style.color;
    ctx.lineWidth = this.style.lineWidth;
    
    if (this.style.lineDash) {
      ctx.setLineDash(this.style.lineDash);
    }

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.lineTo(this.points[1].x, this.points[1].y);
    ctx.stroke();

    // Draw control points if selected
    if (this.isSelected) {
      this.points.forEach(point => {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  hitTest(point: Point, tolerance: number): boolean {
    if (this.points.length < 2) return false;

    const [p1, p2] = this.points;
    const distToLine = this.pointToLineDistance(point, p1, p2);
    
    return distToLine <= tolerance;
  }

  private pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) {
      return Math.sqrt(
        Math.pow(point.x - lineStart.x, 2) + 
        Math.pow(point.y - lineStart.y, 2)
      );
    }

    const t = Math.max(0, Math.min(1, 
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)
    ));

    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    return Math.sqrt(
      Math.pow(point.x - projX, 2) + 
      Math.pow(point.y - projY, 2)
    );
  }

  move(dx: number, dy: number) {
    this.points.forEach(point => {
      point.x += dx;
      point.y += dy;
    });
  }
}

export class HorizontalLine extends DrawingTool {
  constructor(style: DrawingStyle) {
    super('horizontal', style);
  }

  get requiredPoints() {
    return 1;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 1) return;

    ctx.save();
    ctx.strokeStyle = this.style.color;
    ctx.lineWidth = this.style.lineWidth;
    
    if (this.style.lineDash) {
      ctx.setLineDash(this.style.lineDash);
    }

    const y = this.points[0].y;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();

    // Price label
    if (this.points[0].price) {
      ctx.fillStyle = this.style.color;
      ctx.fillRect(ctx.canvas.width - 60, y - 10, 60, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.points[0].price.toFixed(2),
        ctx.canvas.width - 30,
        y + 4
      );
    }

    ctx.restore();
  }

  hitTest(point: Point, tolerance: number): boolean {
    if (this.points.length < 1) return false;
    return Math.abs(point.y - this.points[0].y) <= tolerance;
  }

  move(dx: number, dy: number) {
    this.points.forEach(point => {
      point.y += dy;
    });
  }
}

export class FibonacciRetracement extends DrawingTool {
  private levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

  constructor(style: DrawingStyle) {
    super('fibonacci', style);
  }

  get requiredPoints() {
    return 2;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = this.style.color;
    ctx.lineWidth = this.style.lineWidth;

    const [start, end] = this.points;
    const priceRange = (end.price || 0) - (start.price || 0);

    this.levels.forEach((level, index) => {
      const y = start.y + (end.y - start.y) * level;
      const price = (start.price || 0) + priceRange * level;

      // Alternating opacity
      ctx.globalAlpha = index % 2 === 0 ? 0.1 : 0.05;
      ctx.fillStyle = this.style.color;
      const nextY = index < this.levels.length - 1 
        ? start.y + (end.y - start.y) * this.levels[index + 1]
        : y;
      ctx.fillRect(0, y, ctx.canvas.width, nextY - y);

      // Line
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();

      // Label
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.style.color;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${(level * 100).toFixed(1)}% (${price.toFixed(2)})`,
        5,
        y - 3
      );
    });

    ctx.restore();
  }

  hitTest(point: Point, tolerance: number): boolean {
    if (this.points.length < 2) return false;

    return this.levels.some(level => {
      const y = this.points[0].y + (this.points[1].y - this.points[0].y) * level;
      return Math.abs(point.y - y) <= tolerance;
    });
  }

  move(dx: number, dy: number) {
    this.points.forEach(point => {
      point.x += dx;
      point.y += dy;
    });
  }
}

export class Rectangle extends DrawingTool {
  constructor(style: DrawingStyle) {
    super('rectangle', style);
  }

  get requiredPoints() {
    return 2;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = this.style.color;
    ctx.lineWidth = this.style.lineWidth;

    const [start, end] = this.points;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    // Fill
    if (this.style.fillOpacity) {
      ctx.globalAlpha = this.style.fillOpacity;
      ctx.fillStyle = this.style.color;
      ctx.fillRect(x, y, width, height);
    }

    // Border
    ctx.globalAlpha = 1;
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
  }

  hitTest(point: Point, tolerance: number): boolean {
    if (this.points.length < 2) return false;

    const [start, end] = this.points;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return (
      point.x >= x - tolerance &&
      point.x <= x + width + tolerance &&
      point.y >= y - tolerance &&
      point.y <= y + height + tolerance
    );
  }

  move(dx: number, dy: number) {
    this.points.forEach(point => {
      point.x += dx;
      point.y += dy;
    });
  }
}

export class TextAnnotation extends DrawingTool {
  public text = '';

  constructor(style: DrawingStyle) {
    super('text', style);
  }

  get requiredPoints() {
    return 1;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 1 || !this.text) return;

    ctx.save();
    
    const point = this.points[0];
    const padding = 5;
    
    ctx.font = '14px sans-serif';
    const metrics = ctx.measureText(this.text);
    const width = metrics.width + padding * 2;
    const height = 20;

    // Background
    ctx.fillStyle = this.style.color;
    ctx.fillRect(point.x, point.y, width, height);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, point.x + padding, point.y + height / 2);

    ctx.restore();
  }

  hitTest(point: Point, tolerance: number): boolean {
    if (this.points.length < 1) return false;

    const annotationPoint = this.points[0];
    return (
      Math.abs(point.x - annotationPoint.x) <= tolerance &&
      Math.abs(point.y - annotationPoint.y) <= tolerance
    );
  }

  move(dx: number, dy: number) {
    this.points.forEach(point => {
      point.x += dx;
      point.y += dy;
    });
  }
}

export class DrawingManager {
  private drawings: DrawingTool[] = [];
  private activeTool: DrawingTool | null = null;
  private selectedDrawing: DrawingTool | null = null;
  private isDragging = false;
  private dragStart: Point | null = null;

  public createTool(type: string, style: DrawingStyle): DrawingTool | null {
    switch (type) {
      case 'trendline':
        return new TrendLine(style);
      case 'horizontal':
        return new HorizontalLine(style);
      case 'fibonacci':
        return new FibonacciRetracement(style);
      case 'rectangle':
        return new Rectangle(style);
      case 'text':
        return new TextAnnotation(style);
      default:
        return null;
    }
  }

  public startDrawing(type: string, style: DrawingStyle) {
    this.activeTool = this.createTool(type, style);
  }

  public addPoint(point: Point): boolean {
    if (!this.activeTool) return false;

    const added = this.activeTool.addPoint(point);
    
    if (this.activeTool.isComplete) {
      this.drawings.push(this.activeTool);
      this.activeTool = null;
      return true;
    }
    
    return added;
  }

  public updatePreview(point: Point) {
    if (this.activeTool && this.activeTool.points.length > 0) {
      this.activeTool.updateLastPoint(point);
    }
  }

  public selectDrawing(point: Point, tolerance = 10): DrawingTool | null {
    // Search in reverse order (top to bottom)
    for (let i = this.drawings.length - 1; i >= 0; i--) {
      const drawing = this.drawings[i];
      if (drawing.hitTest(point, tolerance)) {
        this.selectedDrawing?.isSelected && (this.selectedDrawing.isSelected = false);
        drawing.isSelected = true;
        this.selectedDrawing = drawing;
        return drawing;
      }
    }
    
    if (this.selectedDrawing) {
      this.selectedDrawing.isSelected = false;
      this.selectedDrawing = null;
    }
    
    return null;
  }

  public startDrag(point: Point) {
    if (this.selectedDrawing) {
      this.isDragging = true;
      this.dragStart = point;
    }
  }

  public drag(point: Point) {
    if (this.isDragging && this.dragStart && this.selectedDrawing) {
      const dx = point.x - this.dragStart.x;
      const dy = point.y - this.dragStart.y;
      this.selectedDrawing.move(dx, dy);
      this.dragStart = point;
    }
  }

  public endDrag() {
    this.isDragging = false;
    this.dragStart = null;
  }

  public deleteSelected(): boolean {
    if (!this.selectedDrawing) return false;

    const index = this.drawings.indexOf(this.selectedDrawing);
    if (index >= 0) {
      this.drawings.splice(index, 1);
      this.selectedDrawing = null;
      return true;
    }
    
    return false;
  }

  public clearAll() {
    this.drawings = [];
    this.selectedDrawing = null;
    this.activeTool = null;
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render all completed drawings
    this.drawings.forEach(drawing => {
      drawing.render(ctx);
    });

    // Render active tool preview
    if (this.activeTool && this.activeTool.points.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      this.activeTool.render(ctx);
      ctx.restore();
    }
  }

  public saveToStorage(key = 'chart-drawings') {
    const data = this.drawings.map(d => d.toJSON());
    localStorage.setItem(key, JSON.stringify(data));
  }

  public loadFromStorage(key = 'chart-drawings'): boolean {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;

      const drawings = JSON.parse(data);
      // TODO: Reconstruct drawing objects from JSON
      
      return true;
    } catch (error) {
      console.error('Failed to load drawings:', error);
      return false;
    }
  }

  public getDrawings() {
    return [...this.drawings];
  }

  public getActiveTool() {
    return this.activeTool;
  }

  public cancelActiveTool() {
    this.activeTool = null;
  }
}
