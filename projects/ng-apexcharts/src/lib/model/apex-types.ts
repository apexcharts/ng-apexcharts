// export declare class ApexCharts {
//   constructor(el: any, options: ApexOptions);
//   static exec(chartID: string, fn: () => void, options: any): any;
//   static initOnLoad(): void;
//   render(): Promise<void>;
//   updateOptions(options: any, redrawPaths: boolean, animate: boolean): Promise<void>;
//   updateSeries(newSeries: ApexAxisChartSeries | ApexNonAxisChartSeries, animate: boolean): void;
//   toggleSeries(seriesName: string): void;
//   destroy(): void;
//   addXaxisAnnotation(options: any, pushToMemory?: boolean, context?: any): void;
//   addYaxisAnnotation(options: any, pushToMemory?: boolean, context?: any): void;
//   addPointAnnotation(options: any, pushToMemory?: boolean, context?: any): void;
//   addText(options: any, pushToMemory?: boolean, context?: any): void;
//   dataURI(): void;
// }

export interface ApexOptions {
  annotations?: ApexAnnotations;
  chart?: ApexChart;
  colors?: string[];
  dataLabels?: ApexDataLabels;
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  stroke?: ApexStroke;
  labels?: string[];
  legend?: ApexLegend;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  grid?: ApexGrid;
  states?: ApexStates;
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  theme?: ApexTheme;
}

/**
 * Main Chart options
 * See https://apexcharts.com/docs/options/chart/
 */
export interface ApexChart {
  width?: string | number;
  height?: string | number;
  type: ChartType;
  foreColor?: string;
  fontFamily?: string;
  background?: string;
  offsetX?: number;
  offsetY?: number;
  dropShadow?: {
    enabled?: boolean;
    top?: number;
    left?: number;
    blur?: number;
    opacity?: number;
  };
  events?: {
    animationEnd?(chart: any, options: any): void;
    beforeMount?(chart: any, options: any): void;
    mounted?(chart: any, options: any): void;
    updated?(chart: any, options: any): void;
    click?(e: any, chart: any, options: any): void;
    legendClick?(chart: any, seriesIndex: number, options: any): void;
    selection?(chart: any, options: any): void;
    dataPointSelection?(e: any, chart: any, options: any): void;
    dataPointMouseEnter?(e: any, chart: any, options: any): void;
    dataPointMouseLeave?(e: any, chart: any, options: any): void;
    beforeZoom?(chart: any, options: any): void;
    zoomed?(chart: any, options: any): void;
    scrolled?(chart: any, options: any): void;
  };
  brush?: {
    enabled?: boolean;
    autoScaleYaxis?: boolean,
    target?: string;
  };
  id?: string;
  locales?: ApexLocale[];
  defaultLocale?: string;
  sparkline?: {
    enabled?: boolean;
  };
  stacked?: boolean;
  stackType?: 'normal' | '100%';
  toolbar?: {
    show?: boolean;
    tools?: {
      download?: boolean;
      selection?: boolean;
      zoom?: boolean;
      zoomin?: boolean;
      zoomout?: boolean;
      pan?: boolean;
      reset?: boolean;
    };
    autoSelected?: 'zoom' | 'selection' | 'pan';
  };
  zoom?: {
    enabled?: boolean;
    type?: 'x' | 'y' | 'xy';
    zoomedArea?: {
      fill?: {
        color?: string;
        opacity?: number
      };
      stroke?: {
        color?: string;
        opacity?: number;
        width?: number
      }
    }
  };
  selection?: {
    enabled?: boolean;
    type?: string;
    fill?: {
      color?: string;
      opacity?: number;
    };
    stroke?: {
      width?: number;
      color?: string;
      opacity?: number;
      dashArray?: number
    };
    xaxis?: {
      min?: number;
      max?: number;
    };
    yaxis?: {
      min?: number;
      max?: number
    };
  };
  animations?: {
    enabled?: boolean;
    easing?: 'linear' | 'easein' | 'easeout' | 'easeinout';
    speed?: number;
    animateGradually?: {
      enabled?: boolean;
      delay?: number;
    };
    dynamicAnimation?: {
      enabled?: boolean;
      speed?: number;
    }
  };
}

export interface ApexStates {
  normal?: {
    filter?: {
      type?: string,
      value?: number
    }
  };
  hover?: {
    filter?: {
      type?: string,
      value?: number
    }
  };
  active?: {
    allowMultipleDataPointsSelection?: boolean,
    filter?: {
      type?: string,
      value?: number
    }
  };
}

/**
 * Chart Title options
 * See https://apexcharts.com/docs/options/title/
 */
export interface ApexTitleSubtitle {
  text?: string;
  align?: 'left' | 'center' | 'right';
  margin?: number;
  offsetX?: number;
  offsetY?: number;
  floating?: number;
  style?: {
    fontSize?: string;
    color?: string;
  };
}

/**
 * Chart Series options.
 * Use ApexNonAxisChartSeries for Pie and Donut charts.
 * See https://apexcharts.com/docs/options/series/
 */
export type ApexAxisChartSeries = {
  name: string;
  data: number[] | { x: string; y: number }[];
}[];

export type ApexNonAxisChartSeries = number[];

/**
 * Options for the line drawn on line and area charts.
 * See https://apexcharts.com/docs/options/stroke/
 */
export interface ApexStroke {
  show?: boolean;
  curve?: 'smooth' | 'straight' | 'stepline';
  lineCap?: 'butt' | 'square' | 'round';
  colors?: string;
  width?: number;
  dashArray?: number | number[];
}

export interface ApexAnnotations {
  position?: string;
  yaxis?: YAxisAnnotations[];
  xaxis?: XAxisAnnotations[];
  points?: PointAnnotations[];
}

export interface AnnotationLabel {
  borderColor?: string;
  borderWidth?: number;
  text?: string;
  textAnchor?: string;
  offsetX?: number;
  offsetY?: number;
  style?: AnnotationStyle;
  position?: string;
  orientation?: string;
}

export interface AnnotationStyle {
  background?: string;
  color?: string;
  fontSize?: string;
  cssClass?: string;
  padding?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export interface XAxisAnnotations {
  x?: number;
  strokeDashArray?: number;
  borderColor?: string;
  offsetX?: number;
  offsetY?: number;
  label?: {
    borderColor?: string;
    borderWidth?: number;
    text?: string;
    textAnchor?: string;
    position?: string;
    orientation?: string;
    offsetX?: number;
    offsetY?: number;
    style?: AnnotationStyle;
  };
}

export interface YAxisAnnotations {
  y?: number;
  strokeDashArray?: number;
  borderColor?: string;
  offsetX?: number;
  offsetY?: number;
  yAxisIndex?: number;
  label?: AnnotationLabel;
}

export interface PointAnnotations {
  x?: number;
  y?: null;
  yAxisIndex?: number;
  seriesIndex?: number;
  marker?: {
    size?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    shape?: string;
    radius?: number;
  };
  label?: AnnotationLabel;
}

/**
 * Options for localization.
 * See https://apexcharts.com/docs/options/chart/locales
 */
export interface ApexLocale {
  name?: string;
  options?: {
    months?: string[];
    shortMonths?: string[];
    days?: string[];
    shortDays?: string[];
    toolbar?: {
      download?: string;
      selection?: string;
      selectionZoom?: string;
      zoomIn?: string;
      zoomOut?: string;
      pan?: string;
      reset?: string;
    }
  };
}

/**
 * PlotOptions for specifying chart-type-specific configuration.
 * See https://apexcharts.com/docs/options/plotoptions/bar/
 */
export interface ApexPlotOptions {
  bar?: {
    horizontal?: boolean;
    endingShape?: 'flat' | 'rounded' | 'arrow';
    columnWidth?: string;
    barHeight?: string;
    distributed?: boolean;
    colors?: {
      ranges?: {
        from?: number;
        to?: number;
        color?: string;
      }[];
      backgroundBarColors?: string[];
      backgroundBarOpacity?: number;
    };
    dataLabels?: {
      position?: string;
    }
  };
  candlestick?: {
    colors?: {
      upward?: string;
      downward?: string;
    };
    wick?: {
      useFillColor?: boolean
    }
  };
  heatmap?: {
    radius?: number;
    enableShades?: boolean;
    shadeIntensity?: number;
    distributed?: boolean;
    colorScale?: {
      ranges?: {
        from?: number;
        to?: number;
        color?: string;
        name?: string;
      }[];
      inverse?: boolean;
      min?: number;
      max?: number;
    }
  };
  pie?: {
    size?: number;
    customScale?: number;
    offsetX?: number;
    offsetY?: number;
    expandOnClick?: boolean;
    dataLabels?: {
      offset?: number;
    };
    donut?: {
      size?: string;
      background?: string;
      labels: {
        show?: boolean;
        name?: {
          show?: boolean;
          fontSize?: string;
          fontFamily?: string;
          color?: string;
          offsetY?: number
        };
        value?: {
          show?: boolean;
          fontSize?: string;
          fontFamily?: string;
          color?: string;
          offsetY?: number;
          formatter?(val: string): string;
        };
        total?: {
          show?: boolean;
          label?: string;
          color?: string;
          formatter?(w: any): string;
        }
      }
    };
  };
  radar?: {
    size?: number;
    offsetX?: number;
    offsetY?: number;
    polygons?: {
      strokeColor?: string;
      connectorColors?: string | string[];
      fill?: {
        colors?: string[]
      }
    }
  };
  radialBar?: {
    size?: number;
    inverseOrder?: boolean;
    startAngle?: number;
    endAngle?: number;
    offsetX?: number;
    offsetY?: number;
    hollow?: {
      margin?: number;
      size?: string;
      background?: string;
      image?: string;
      width?: number;
      height?: number;
      offsetX?: number;
      offsetY?: number;
      clipped?: boolean;
      position?: 'front' | 'back';
    };
    track?: {
      show?: boolean;
      startAngle?: number;
      endAngle?: number;
      background?: string;
      strokeWidth?: string;
      opacity?: number;
      margin?: number;
      dropShadow?: {
        enabled?: boolean;
        top?: number;
        left?: number;
        blur?: number;
        opacity?: number
      }
    };
    dataLabels?: {
      show?: boolean;
      name?: {
        show?: boolean;
        fontSize?: string;
        color?: string;
        offsetY?: number;
      };
      value?: {
        show?: boolean;
        fontSize?: string;
        color?: string;
        offsetY?: number;
        formatter?(val: number): string;
      };
      total?: {
        show?: boolean;
        label?: string;
        color?: string;
        formatter?(opts: any): string;
      };
    }
  };
}

export interface ApexFill {
  colors?: string[];
  opacity?: number;
  type?: string;
  gradient?: {
    shade?: string;
    type?: string;
    shadeIntensity?: number;
    gradientToColors?: string[];
    inverseColors?: boolean;
    opacityFrom?: number;
    opacityTo?: number;
    stops?: number[]
  };
  image?: {
    src?: string[];
    width?: number;
    height?: number
  };
  pattern?: {
    style?: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
  };
}

/**
 * Chart Legend configuration options.
 * See https://apexcharts.com/docs/options/legend/
 */
export interface ApexLegend {
  show?: boolean;
  showForSingleSeries?: boolean;
  showForNullSeries?: boolean;
  showForZeroSeries?: boolean;
  floating?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
  horizontalAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontFamily?: string;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  textAnchor?: string;
  labels?: {
    color?: string;
    useSeriesColors?: boolean;
  };
  markers?: {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
    offsetX?: number;
    offsetY?: number;
    radius?: number;
    shape?: 'circle' | 'square';
    customHTML?(): string;
    onClick?(): void;
  };
  itemMargin?: {
    horizontal?: number;
    vertical?: number;
  };
  containerMargin?: {
    left?: number;
    top?: number;
  };
  onItemClick?: {
    toggleDataSeries?: boolean;
  };
  onItemHover?: {
    highlightDataSeries?: boolean;
  };
  formatter?(val: string, opts: any): string;
}

/**
 * Chart Datalabels options
 * See https://apexcharts.com/docs/options/datalabels/
 */
export interface ApexDataLabels {
  enabled?: boolean;
  textAnchor?: 'start' | 'middle' | 'end';
  offsetX?: number;
  offsetY?: number;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    colors?: string[];
  };
  dropShadow?: {
    enabled: boolean;
    top?: number;
    left?: number;
    blur?: number;
    opacity?: number;
  };
  formatter?(val: number, opts: any): string;
}

export interface ApexResponsive {
  breakpoint?: number;
  options?: any;
}

/**
 * Chart Tooltip options
 * See https://apexcharts.com/docs/options/tooltip/
 */
export interface ApexTooltip {
  enabled?: boolean;
  shared?: boolean;
  followCursor?: boolean;
  intersect?: boolean;
  inverseOrder?: boolean;
  theme?: string;
  style?: {
    fontSize?: string;
    fontFamily?: string;
  };
  fillSeriesColor?: boolean;
  onDatasetHover?: {
    highlightDAtaSeries?: boolean;
  };
  x?: {
    show?: boolean;
    format?: string;
    formatter?(val: number): string;
  };
  y?: {
    show?: boolean;
    title?: {
      formatter?(seriesName: string): string;
    }
    formatter?(val: number): string;
  };
  z?: {
    title?: string;
    formatter?(val: number): string;
  };
  marker?: {
    show?: boolean
  };
  items?: {
    display?: string
  };
  fixed?: {
    enabled?: boolean;
    position?: string; // topRight; topLeft; bottomRight; bottomLeft
    offsetX?: number;
    offsetY?: number
  };
  custom?(options: any): void;
}

/**
 * X Axis options
 * See https://apexcharts.com/docs/options/xaxis/
 */
export interface ApexXAxis {
  type?: 'categories' | 'datetime' | 'numeric';
  categories?: string[] | number[];
  labels?: {
    show?: boolean;
    rotate?: number;
    rotateAlways?: boolean;
    hideOverlappingLabels?: boolean;
    showDuplicates?: boolean;
    trim?: boolean;
    minHeight?: number;
    maxHeight?: number;
    style?: {
      colors?: string[];
      fontSize?: string;
      fontFamily?: string;
      cssClass?: string;
    };
    offsetX?: number;
    offsetY?: number;
    format?: string;
    datetimeFormatter?: {
      year?: string;
      month?: string;
      day?: string;
      hour?: string;
      minute?: string;
    };
    formatter?(value: string, timestamp: number): string;
  };
  axisBorder?: {
    show?: boolean;
    color?: string;
    offsetX?: number;
    offsetY?: number;
    strokeWidth?: number;
  };
  axisTicks?: {
    show?: boolean;
    borderType?: string;
    color?: string;
    height?: number;
    offsetX?: number;
    offsetY?: number;
  };
  tickAmount?: number;
  min?: number;
  max?: number;
  range?: number;
  floating?: boolean;
  position?: string;
  title?: {
    text?: string;
    offsetX?: number;
    offsetY?: number;
    style?: {
      color?: string;
      fontSize?: string;
      cssClass?: string;
    };
  };
  crosshairs?: {
    show?: boolean;
    width?: number | string;
    position?: string;
    opacity?: number;
    stroke?: {
      color?: string;
      width?: number;
      dashArray?: number;
    };
    fill?: {
      type?: string;
      color?: string;
      gradient?: {
        colorFrom?: string;
        colorTo?: string;
        stops?: number[];
        opacityFrom?: number;
        opacityTo?: number;
      };
    };
    dropShadow?: {
      enabled?: boolean;
      top?: number;
      left?: number;
      blur?: number;
      opacity?: number;
    };
  };
  tooltip?: {
    enabled?: boolean;
    offsetY?: number;
  };
}

/**
 * Y Axis options
 * See https://apexcharts.com/docs/options/yaxis/
 */
export interface ApexYAxis {
  show?: boolean;
  showAlways?: boolean;
  seriesName?: string;
  opposite?: boolean;
  logarithmic?: boolean;
  tickAmount?: number;
  forceNiceScale?: boolean,
  min?: number;
  max?: number;
  floating?: boolean;
  decimalsInFloat?: number;
  labels?: {
    show?: boolean;
    minWidth?: number;
    maxWidth?: number;
    offsetX?: number;
    offsetY?: number;
    rotate?: number;
    align?: 'left' | 'center' | 'right';
    padding?: number,
    style?: {
      color?: string;
      fontSize?: string;
      fontFamily?: string;
      cssClass?: string;
    };
    formatter?(val: number): string;
  };
  axisBorder?: {
    show?: boolean;
    color?: string;
    offsetX?: number;
    offsetY?: number
  };
  axisTicks?: {
    show?: boolean;
    color?: string;
    width?: number;
    offsetX?: number;
    offsetY?: number
  };
  title?: {
    text?: string;
    rotate?: number;
    offsetX?: number;
    offsetY?: number;
    style?: {
      color?: string;
      fontSize?: string;
      fontFamily?: string;
      cssClass?: string;
    };
  };
  crosshairs?: {
    show?: boolean;
    position?: string;
    stroke?: {
      color?: string;
      width?: number;
      dashArray?: number
    };
  };
  tooltip?: {
    enabled?: boolean;
    offsetX?: number;
  };
}

/**
 * Plot X and Y grid options
 * See https://apexcharts.com/docs/options/grid/
 */
export interface ApexGrid {
  show?: boolean;
  borderColor?: string;
  strokeDashArray?: number;
  position?: 'front' | 'back';
  xaxis?: {
    lines?: {
      show?: boolean;
      offsetX?: number;
      offsetY?: number;
    }
  };
  yaxis?: {
    lines?: {
      show?: boolean;
      offsetX?: number;
      offsetY?: number;
    }
  };
  row?: {
    colors?: string[];
    opacity?: number
  };
  column?: {
    colors?: string[];
    opacity?: number;
  };
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface ApexTheme {
  palette?: string;
  monochrome?: {
    enabled?: boolean,
    color?: string;
    shadeTo?: 'light' | 'dark';
    shadeIntensity?: number
  };
}

interface ApexDiscretePoint {
  seriesIndex?: number;
  dataPointIndex?: number;
  fillColor?: string;
  strokeColor?: string;
  size?: number;
}

export interface ApexMarkers {
  size?: number;
  colors?: string[];
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  fillOpacity?: number;
  discrete?: ApexDiscretePoint[];
  shape?: 'circle' | 'square';
  radius?: number;
  offsetX?: number;
  offsetY?: number;
  hover?: {
    size?: number;
    sizeOffset?: number;
  };
}


export interface ApexNoData {
  text?: string,
  align?: 'left' | 'right' | 'center',
  verticalAlign?: 'top' | 'middle' | 'bottom',
  offsetX?: number,
  offsetY?: number,
  style?: {
    color?: string,
    fontSize?: string,
    fontFamily?: string
  }
}

export type ChartType = 'line' | 'area' | 'bar' | 'histogram' | 'pie' | 'donut' |
  'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar';
