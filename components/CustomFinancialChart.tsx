import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { ChartDataPoint } from '../types';

interface CustomFinancialChartProps {
  data: ChartDataPoint[];
  indicators: {
    sma: boolean;
    ema: boolean;
    bb: boolean;
    rsi: boolean;
    macd: boolean;
    stochastic: boolean;
    volume: boolean;
    ichimoku: boolean;
    atr: boolean;
    awesomeOscillator: boolean;
  };
  theme: 'light' | 'dark';
}

const darkColors = {
  background: '#1e1e1e',
  text: '#a0aec0',
  grid: 'rgba(255, 255, 255, 0.1)',
  crosshair: '#a0aec0',
  up: '#48bb78',
  down: '#f56565',
  volume: 'rgba(128, 90, 213, 0.4)',
  sma: '#f6ad55',
  ema: '#4fd1c5',
  bb: 'rgba(246, 135, 179, 0.7)',
  rsi: '#a78bfa',
  macd: '#60a5fa',
  macdSignal: '#f472b6',
  ichimokuTenkan: '#0e9f6e',
  ichimokuKijun: '#ff5a1f',
  ichimokuChikou: '#a0aec0',
  ichimokuKumoUp: 'rgba(74, 222, 128, 0.2)',
  ichimokuKumoDown: 'rgba(248, 113, 113, 0.2)',
};

const lightColors = {
    background: '#ffffff',
    text: '#374151',
    grid: 'rgba(0, 0, 0, 0.1)',
    crosshair: '#4b5563',
    up: '#10b981',
    down: '#ef4444',
    volume: 'rgba(167, 139, 250, 0.4)',
    sma: '#f59e0b',
    ema: '#22d3ee',
    bb: 'rgba(236, 72, 153, 0.7)',
    rsi: '#8b5cf6',
    macd: '#3b82f6',
    macdSignal: '#ec4899',
    ichimokuTenkan: '#059669',
    ichimokuKijun: '#ea580c',
    ichimokuChikou: '#6b7280',
    ichimokuKumoUp: 'rgba(52, 211, 153, 0.2)',
    ichimokuKumoDown: 'rgba(251, 113, 133, 0.2)',
};

const INDICATOR_PANEL_HEIGHT = 80;
const Y_AXIS_WIDTH = 65;
const X_AXIS_HEIGHT = 25;


const CustomFinancialChart: React.FC<CustomFinancialChartProps> = ({ data, indicators, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({
    offset: 0,
    zoom: 1,
    crosshairX: null as number | null,
    crosshairY: null as number | null,
  });

  const chartState = useRef({
    isDragging: false,
    dragStart: 0,
    initialOffset: 0,
    width: 0,
    height: 0,
    chartWidth: 0,
    mainChartHeight: 0,
    rsiPanel: { y: 0, height: 0 },
    macdPanel: { y: 0, height: 0 },
    // Touch gesture state
    lastTouchDistance: 0,
    initialZoom: 1,
    touchStartTime: 0,
    longPressTimer: null as number | null,
  }).current;

  const colors = theme === 'dark' ? darkColors : lightColors;

  const candleWidth = 8;
  const visibleCandles = Math.floor(chartState.chartWidth / (candleWidth * view.zoom));
  const startIndex = Math.max(0, data.length - visibleCandles - view.offset);
  const endIndex = Math.min(data.length, startIndex + visibleCandles);
  
  // Extend visible range for Ichimoku's future cloud
  const futureIchimokuIndex = indicators.ichimoku ? endIndex + 26 : endIndex;
  
  const { minPrice, maxPrice, maxVolume, minMACD, maxMACD } = useMemo(() => {
    const priceData = data.slice(startIndex, endIndex);
    if (priceData.length === 0) return { minPrice: 0, maxPrice: 1, maxVolume: 1, minMACD: -1, maxMACD: 1 };
    
    let minP = Infinity, maxP = -Infinity, maxV = 0, minM = Infinity, maxM = -Infinity;

    for (const d of priceData) {
        const lows: (number | null)[] = [d.low];
        const highs: (number | null)[] = [d.high];

        if (indicators.sma && d.sma50 != null) { lows.push(d.sma50); highs.push(d.sma50); }
        if (indicators.ema && d.ema20 != null) { lows.push(d.ema20); highs.push(d.ema20); }
        if (indicators.bb) {
            if (d.bbUpper != null) highs.push(d.bbUpper);
            if (d.bbLower != null) lows.push(d.bbLower);
        }
        if (indicators.ichimoku) {
            if(d.ichimokuTenkan != null) { lows.push(d.ichimokuTenkan); highs.push(d.ichimokuTenkan); }
            if(d.ichimokuKijun != null) { lows.push(d.ichimokuKijun); highs.push(d.ichimokuKijun); }
            if(d.ichimokuChikou != null) { lows.push(d.ichimokuChikou); highs.push(d.ichimokuChikou); }
        }
        
        // Include future cloud values in price range
        const futureIndex = data.indexOf(d) + 26;
        if(indicators.ichimoku && futureIndex < data.length) {
            const futurePoint = data[futureIndex];
            if(futurePoint?.ichimokuSenkouA != null) { lows.push(futurePoint.ichimokuSenkouA); highs.push(futurePoint.ichimokuSenkouA); }
            if(futurePoint?.ichimokuSenkouB != null) { lows.push(futurePoint.ichimokuSenkouB); highs.push(futurePoint.ichimokuSenkouB); }
        }
        
        minP = Math.min(minP, ...lows.filter((v): v is number => v !== null && isFinite(v)));
        maxP = Math.max(maxP, ...highs.filter((v): v is number => v !== null && isFinite(v)));
        maxV = Math.max(maxV, d.volume);

        if (indicators.macd) {
            const macdValues = [d.macd, d.macdSignal, d.macdHist].filter((v): v is number => v !== null && isFinite(v));
            if(macdValues.length > 0) {
              minM = Math.min(minM, ...macdValues);
              maxM = Math.max(maxM, ...macdValues);
            }
        }
    }

    const pricePadding = (maxP - minP) * 0.1;
    const macdPadding = (maxM - minM) * 0.1;

    return { 
        minPrice: minP - pricePadding, 
        maxPrice: maxP + pricePadding, 
        maxVolume: maxV * 4, // give more room for volume bars
        minMACD: minM - macdPadding, 
        maxMACD: maxM + macdPadding,
    };
  }, [startIndex, endIndex, indicators, data]);
  
  // Coordinate functions
  const getX = (index: number) => (index - startIndex) * (candleWidth * view.zoom) + (candleWidth * view.zoom) / 2;
  const getIndexFromX = (x: number) => Math.floor(startIndex + x / (candleWidth * view.zoom));

  const getPriceFromY = (y: number) => maxPrice - (y / chartState.mainChartHeight) * (maxPrice - minPrice);
  const getPriceY = (price: number) => chartState.mainChartHeight * (1 - (price - minPrice) / (maxPrice - minPrice));

  const getVolumeY = (volume: number) => chartState.mainChartHeight - (volume / maxVolume) * chartState.mainChartHeight;

  const getRSIY = (rsi: number) => chartState.rsiPanel.y + chartState.rsiPanel.height * (1 - rsi / 100);
  
  const getMACDY = (value: number) => chartState.macdPanel.y + chartState.macdPanel.height * (1 - (value - minMACD) / (maxMACD - minMACD));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, chartState.width, chartState.height);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, chartState.width, chartState.height);
    
    // Main Chart
    drawGrid(ctx, 0, chartState.mainChartHeight);
    if (indicators.volume) drawVolume(ctx);
    drawCandles(ctx);
    drawMainIndicators(ctx);
    drawYAxis(ctx, 0, chartState.mainChartHeight, minPrice, maxPrice, (p) => p.toFixed(2));
    
    // RSI Panel
    if (indicators.rsi) {
      drawGrid(ctx, chartState.rsiPanel.y, chartState.rsiPanel.height);
      drawRSI(ctx);
      drawYAxis(ctx, chartState.rsiPanel.y, chartState.rsiPanel.height, 0, 100, (p) => p.toFixed(0));
    }
    
    // MACD Panel
    if (indicators.macd) {
      drawGrid(ctx, chartState.macdPanel.y, chartState.macdPanel.height);
      drawMACD(ctx);
      drawYAxis(ctx, chartState.macdPanel.y, chartState.macdPanel.height, minMACD, maxMACD, (p) => p.toExponential(1));
    }
    
    drawXAxis(ctx);
    drawCrosshair(ctx);
    drawLegend(ctx);
  };
  
  const drawGrid = (ctx: CanvasRenderingContext2D, yOffset: number, height: number) => {
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
          const y = yOffset + (height * i / 5);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(chartState.chartWidth, y);
          ctx.stroke();
      }

      // Vertical lines
      const timeStep = Math.max(1, Math.floor(visibleCandles / 5));
      for (let i = startIndex; i < endIndex; i += timeStep) {
          const x = getX(i);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chartState.height - X_AXIS_HEIGHT);
          ctx.stroke();
      }
  };
  
  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    // Draw legend showing active indicators
    const legendItems: { label: string; color: string }[] = [];
    
    if (indicators.sma) legendItems.push({ label: 'SMA50', color: colors.sma });
    if (indicators.ema) legendItems.push({ label: 'EMA20', color: colors.ema });
    if (indicators.bb) legendItems.push({ label: 'BB', color: colors.bb });
    if (indicators.rsi) legendItems.push({ label: 'RSI', color: colors.rsi });
    if (indicators.macd) legendItems.push({ label: 'MACD', color: colors.macd });
    if (indicators.ichimoku) legendItems.push({ label: 'Ichimoku', color: colors.ichimokuTenkan });
    
    if (legendItems.length === 0) return;
    
    // Calculate legend dimensions
    ctx.font = '12px sans-serif';
    let totalWidth = 0;
    const itemWidths: number[] = [];
    
    for (const item of legendItems) {
        const textWidth = ctx.measureText(item.label).width;
        const itemWidth = textWidth + 20; // 10px color box + 5px padding + text + 5px padding
        itemWidths.push(itemWidth);
        totalWidth += itemWidth + 10; // 10px spacing between items
    }
    
    // Draw legend background at top-left
    const padding = 8;
    const legendHeight = 20;
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.95;
    ctx.fillRect(padding, padding, totalWidth + padding, legendHeight + padding * 2);
    ctx.globalAlpha = 1;
    
    // Draw legend items
    let xOffset = padding * 2;
    for (let i = 0; i < legendItems.length; i++) {
        const item = legendItems[i];
        
        // Draw color box
        ctx.fillStyle = item.color;
        ctx.fillRect(xOffset, padding + 4, 10, 10);
        
        // Draw label
        ctx.fillStyle = colors.text;
        ctx.fillText(item.label, xOffset + 15, padding + 12);
        
        xOffset += itemWidths[i] + 10;
    }
  };

  const drawYAxis = (ctx: CanvasRenderingContext2D, yOffset: number, height: number, minVal: number, maxVal: number, formatter: (val: number) => string) => {
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    const range = maxVal - minVal;
    const maxLabelWidth = Y_AXIS_WIDTH - 10; // Leave 5px margin on each side
    
    for (let i = 0; i <= 5; i++) {
        const val = maxVal - (range * i / 5);
        const y = yOffset + (height * i / 5);
        const label = formatter(val);
        const textWidth = ctx.measureText(label).width;
        
        // Measure text and truncate if needed
        let displayLabel = label;
        if (textWidth > maxLabelWidth) {
            // Try to truncate while keeping it readable
            displayLabel = label.substring(0, Math.max(1, Math.floor(label.length * maxLabelWidth / textWidth))) + '...';
        }
        
        // Draw background for better readability
        const finalTextWidth = ctx.measureText(displayLabel).width;
        ctx.fillStyle = colors.background;
        ctx.fillRect(chartState.chartWidth, y - 8, Y_AXIS_WIDTH, 16);
        
        // Draw text right-aligned within the axis width
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'right';
        ctx.fillText(displayLabel, chartState.chartWidth + Y_AXIS_WIDTH - 5, y + 4);
        ctx.textAlign = 'left';
    }
  };

  const drawXAxis = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Dynamically adjust timeStep to avoid overlapping labels
    let timeStep = Math.max(1, Math.floor(visibleCandles / 5));
    let minLabelSpacing = 60; // Minimum pixel spacing between labels
    
    // Measure first label to ensure spacing
    const sampleDate = new Date(data[startIndex]?.time * 1000 || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
    const labelWidth = ctx.measureText(sampleDate).width + 10; // Add margin
    
    // Adjust timeStep to ensure labels don't overlap
    while (true) {
        const pixelsPerCandle = (chartState.chartWidth / visibleCandles) * view.zoom;
        const pixelsBetweenLabels = pixelsPerCandle * timeStep;
        if (pixelsBetweenLabels >= labelWidth || timeStep >= visibleCandles / 2) break;
        timeStep++;
    }
    
    for (let i = startIndex; i < endIndex; i += timeStep) {
        const d = data[i];
        if (!d) continue;
        const x = getX(i);
        if (x < 0 || x > chartState.chartWidth) continue; // Skip if outside visible area
        
        const date = new Date(d.time * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
        
        // Draw background for better readability
        const textWidth = ctx.measureText(date).width;
        ctx.fillStyle = colors.background;
        ctx.fillRect(x - textWidth/2 - 5, chartState.height - X_AXIS_HEIGHT, textWidth + 10, X_AXIS_HEIGHT - 2);
        
        // Draw text
        ctx.fillStyle = colors.text;
        ctx.fillText(date, x, chartState.height - 5);
    }
    ctx.textAlign = 'left';
  }

  const drawVolume = (ctx: CanvasRenderingContext2D) => {
    for (let i = startIndex; i < endIndex; i++) {
        const d = data[i];
        if(!d) continue;
        const x = getX(i);
        const y = getVolumeY(d.volume);
        const barHeight = chartState.mainChartHeight - y;
        ctx.fillStyle = d.close >= d.open ? colors.up : colors.down;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x - candleWidth * view.zoom * 0.4, y, candleWidth * view.zoom * 0.8, barHeight);
        ctx.globalAlpha = 1;
    }
  };

  const drawCandles = (ctx: CanvasRenderingContext2D) => {
    for (let i = startIndex; i < endIndex; i++) {
      const d = data[i];
      if(!d) continue;
      const x = getX(i);
      
      const yOpen = getPriceY(d.open);
      const yHigh = getPriceY(d.high);
      const yLow = getPriceY(d.low);
      const yClose = getPriceY(d.close);
      
      const isUp = d.close >= d.open;
      const color = isUp ? colors.up : colors.down;
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;
      
      // Wick
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Body
      const bodyHeight = Math.abs(yOpen - yClose);
      ctx.fillRect(x - (candleWidth * view.zoom * 0.4), Math.min(yOpen, yClose), candleWidth * view.zoom * 0.8, bodyHeight > 1 ? bodyHeight : 1);
    }
    ctx.lineWidth = 1;
  };
  
  const drawLine = (ctx: CanvasRenderingContext2D, getY: (val: number) => number, dataKey: keyof ChartDataPoint, color: string, width = 2, rangeStart = startIndex, rangeEnd = endIndex, xShift = 0) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    let firstPoint = true;
    for (let i = rangeStart; i < rangeEnd; i++) {
      const d = data[i];
      if (!d) continue;
      const value = d[dataKey];
      if (typeof value === 'number' && isFinite(value)) {
        const x = getX(i + xShift);
        if(x > chartState.chartWidth + 50) continue; // Perf optimization
        if(x < -50) continue; // Perf optimization

        const y = getY(value);

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const drawArea = (ctx: CanvasRenderingContext2D, upperKey: keyof ChartDataPoint, lowerKey: keyof ChartDataPoint, colorUp: string, colorDown: string) => {
    const points: {x: number, y1: number, y2: number}[] = [];

    for (let i = startIndex - 26; i < futureIchimokuIndex; i++) {
        const d = data[i];
        if (!d) continue;
        const upperValue = d[upperKey];
        const lowerValue = d[lowerKey];
        if (typeof upperValue === 'number' && typeof lowerValue === 'number') {
            const x = getX(i);
            if(x > chartState.chartWidth + 50) break;
            points.push({ x, y1: getPriceY(upperValue), y2: getPriceY(lowerValue) });
        }
    }

    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        const isUp = p1.y1 < p1.y2; 
        ctx.fillStyle = isUp ? colorUp : colorDown;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y1);
        ctx.lineTo(p2.x, p2.y1);
        ctx.lineTo(p2.x, p2.y2);
        ctx.lineTo(p1.x, p1.y2);
        ctx.closePath();
        ctx.fill();
    }
  };
  
  const drawMainIndicators = (ctx: CanvasRenderingContext2D) => {
    if (indicators.sma) drawLine(ctx, getPriceY, 'sma50', colors.sma);
    if (indicators.ema) drawLine(ctx, getPriceY, 'ema20', colors.ema);
    if (indicators.bb) {
      drawLine(ctx, getPriceY, 'bbUpper', colors.bb, 1);
      drawLine(ctx, getPriceY, 'bbMiddle', colors.bb, 2);
      drawLine(ctx, getPriceY, 'bbLower', colors.bb, 1);
    }
    if (indicators.ichimoku) {
      drawArea(ctx, 'ichimokuSenkouA', 'ichimokuSenkouB', colors.ichimokuKumoUp, colors.ichimokuKumoDown);
      drawLine(ctx, getPriceY, 'ichimokuTenkan', colors.ichimokuTenkan, 1.5);
      drawLine(ctx, getPriceY, 'ichimokuKijun', colors.ichimokuKijun, 1.5);
      drawLine(ctx, getPriceY, 'ichimokuChikou', colors.ichimokuChikou, 1, startIndex, endIndex, -26);
    }
  };

  const drawRSI = (ctx: CanvasRenderingContext2D) => {
      // Overbought/oversold lines
      ctx.strokeStyle = colors.grid;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(0, getRSIY(70)); ctx.lineTo(chartState.chartWidth, getRSIY(70)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, getRSIY(30)); ctx.lineTo(chartState.chartWidth, getRSIY(30)); ctx.stroke();
      ctx.setLineDash([]);
      
      drawLine(ctx, getRSIY, 'rsi', colors.rsi);
  };

  const drawMACD = (ctx: CanvasRenderingContext2D) => {
      const zeroY = getMACDY(0);
      if (zeroY > chartState.macdPanel.y && zeroY < chartState.macdPanel.y + chartState.macdPanel.height) {
        ctx.strokeStyle = colors.grid;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(chartState.chartWidth, zeroY); ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Histogram
      for(let i = startIndex; i < endIndex; i++) {
        const d = data[i];
        if(!d || d.macdHist == null) continue;
        const x = getX(i);
        const y = getMACDY(d.macdHist);
        ctx.strokeStyle = d.macdHist >= 0 ? colors.up : colors.down;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = candleWidth * view.zoom * 0.4;
        ctx.beginPath();
        ctx.moveTo(x, zeroY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
      }
      
      drawLine(ctx, getMACDY, 'macd', colors.macd);
      drawLine(ctx, getMACDY, 'macdSignal', colors.macdSignal);
  };
  
  const drawCrosshair = (ctx: CanvasRenderingContext2D) => {
    if (view.crosshairX === null || view.crosshairY === null || view.crosshairX > chartState.chartWidth) return;
    
    ctx.strokeStyle = colors.crosshair;
    ctx.setLineDash([5, 5]);
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, view.crosshairY);
    ctx.lineTo(chartState.chartWidth, view.crosshairY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(view.crosshairX, 0);
    ctx.lineTo(view.crosshairX, chartState.height - X_AXIS_HEIGHT);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Price label
    if (view.crosshairY < chartState.mainChartHeight) {
        const price = getPriceFromY(view.crosshairY);
        ctx.fillStyle = colors.background;
        ctx.fillRect(chartState.chartWidth, view.crosshairY - 10, Y_AXIS_WIDTH, 20);
        ctx.fillStyle = colors.text;
        ctx.fillText(price.toFixed(2), chartState.chartWidth + 5, view.crosshairY + 4);
    }
    
    // Date label
    const index = getIndexFromX(view.crosshairX);
    if(data[index]) {
        const date = new Date(data[index].time * 1000).toLocaleString();
        const textWidth = ctx.measureText(date).width;
        ctx.fillStyle = colors.background;
        ctx.fillRect(view.crosshairX - textWidth/2 - 5, chartState.height - X_AXIS_HEIGHT, textWidth + 10, X_AXIS_HEIGHT);
        ctx.fillStyle = colors.text;
        ctx.fillText(date, view.crosshairX - textWidth/2, chartState.height - 5);
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        const dpr = window.devicePixelRatio || 1;
        
        // Allocate full width for canvas (includes chart + Y-axis)
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        ctx?.scale(dpr, dpr);
        
        chartState.width = width;
        chartState.height = height;
        // Chart area takes up full width minus Y_AXIS_WIDTH
        chartState.chartWidth = width - Y_AXIS_WIDTH;

        let indicatorPanelsCount = 0;
        if (indicators.rsi) indicatorPanelsCount++;
        if (indicators.macd) indicatorPanelsCount++;
        
        const totalIndicatorHeight = indicatorPanelsCount * INDICATOR_PANEL_HEIGHT;
        chartState.mainChartHeight = height - totalIndicatorHeight - X_AXIS_HEIGHT; 

        let yPos = chartState.mainChartHeight;
        chartState.rsiPanel = { y: 0, height: 0 };
        chartState.macdPanel = { y: 0, height: 0 };

        if(indicators.rsi) {
            chartState.rsiPanel = { y: yPos, height: INDICATOR_PANEL_HEIGHT };
            yPos += INDICATOR_PANEL_HEIGHT;
        }
        if(indicators.macd) {
            chartState.macdPanel = { y: yPos, height: INDICATOR_PANEL_HEIGHT };
            yPos += INDICATOR_PANEL_HEIGHT;
        }

        draw();
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [indicators]); // Re-run when indicators change to adjust layout
  
  useEffect(() => {
    draw();
  }, [data, view, indicators, theme, colors, minPrice, maxPrice, minMACD, maxMACD]); 

  const handleMouseDown = (e: React.MouseEvent) => {
    chartState.isDragging = true;
    chartState.dragStart = e.clientX;
    chartState.initialOffset = view.offset;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (chartState.isDragging) {
      const dx = e.clientX - chartState.dragStart;
      const offsetChange = Math.round(dx / (candleWidth * view.zoom));
      const newOffset = Math.max(0, Math.min(data.length - 10, chartState.initialOffset - offsetChange));
      setView(v => ({...v, offset: newOffset, crosshairX: x, crosshairY: y }));
    } else {
        setView(v => ({...v, crosshairX: x, crosshairY: y}));
    }
  };

  const handleMouseUp = () => {
    chartState.isDragging = false;
  };

  const handleMouseLeave = () => {
    chartState.isDragging = false;
    setView(v => ({...v, crosshairX: null, crosshairY: null}));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.2, Math.min(10, view.zoom * zoomFactor));

    // Zoom centered on the cursor
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const indexAtCursor = getIndexFromX(mouseX);

    const newOffset = Math.round(view.offset + (indexAtCursor - startIndex) * (1 - newZoom / view.zoom));

    setView(v => ({ ...v, zoom: newZoom, offset: Math.max(0, newOffset) }));
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      chartState.isDragging = true;
      chartState.dragStart = touch.clientX;
      chartState.initialOffset = view.offset;
      chartState.touchStartTime = Date.now();
      
      // Long press for crosshair
      chartState.longPressTimer = window.setTimeout(() => {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        setView(v => ({...v, crosshairX: x, crosshairY: y}));
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    } else if (e.touches.length === 2) {
      // Two finger pinch - start zooming
      if (chartState.longPressTimer) {
        clearTimeout(chartState.longPressTimer);
        chartState.longPressTimer = null;
      }
      chartState.isDragging = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      chartState.lastTouchDistance = distance;
      chartState.initialZoom = view.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    
    if (chartState.longPressTimer) {
      clearTimeout(chartState.longPressTimer);
      chartState.longPressTimer = null;
    }
    
    if (e.touches.length === 1 && chartState.isDragging) {
      // Single finger drag
      const touch = e.touches[0];
      const dx = touch.clientX - chartState.dragStart;
      const offsetChange = Math.round(dx / (candleWidth * view.zoom));
      const newOffset = Math.max(0, Math.min(data.length - 10, chartState.initialOffset - offsetChange));
      
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setView(v => ({...v, offset: newOffset, crosshairX: x, crosshairY: y }));
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (chartState.lastTouchDistance > 0) {
        const zoomFactor = distance / chartState.lastTouchDistance;
        const newZoom = Math.max(0.2, Math.min(10, chartState.initialZoom * zoomFactor));
        
        // Zoom centered on the midpoint between fingers
        const midX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
        const indexAtCenter = getIndexFromX(midX);
        const newOffset = Math.round(view.offset + (indexAtCenter - startIndex) * (1 - newZoom / view.zoom));
        
        setView(v => ({ ...v, zoom: newZoom, offset: Math.max(0, newOffset) }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (chartState.longPressTimer) {
      clearTimeout(chartState.longPressTimer);
      chartState.longPressTimer = null;
    }
    
    // Check for double tap
    const touchDuration = Date.now() - chartState.touchStartTime;
    if (e.touches.length === 0 && touchDuration < 300 && !chartState.isDragging) {
      // Quick tap - could be double tap
      // Reset zoom on double tap (implement if needed)
    }
    
    chartState.isDragging = false;
    chartState.lastTouchDistance = 0;
    
    // Hide crosshair after touch ends
    if (e.touches.length === 0) {
      setTimeout(() => {
        setView(v => ({...v, crosshairX: null, crosshairY: null}));
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden touch-none">
      <canvas 
        ref={canvasRef} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseLeave} 
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="block w-full h-full cursor-crosshair"
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
    </div>
  );
};

export default CustomFinancialChart;