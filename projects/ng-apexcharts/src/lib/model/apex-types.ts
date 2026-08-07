/**
 * Public type surface of ng-apexcharts.
 *
 * Since apexcharts 6.x the upstream package exports its option types as named
 * module exports, so this file re-exports them instead of maintaining a
 * hand-synced copy. The vendored copy this replaces had drifted badly from
 * upstream (issue #504): it was missing v6 additions such as
 * `plotOptions.pie.dataLabels.external`, `ApexDrilldownEvent`, and
 * `chart.perspective`.
 *
 * Strict typing now follows the installed apexcharts version. apexcharts 5.x
 * declares these names only on the UMD global namespace (nothing is
 * importable from the module), which is why a vendored copy existed in the
 * first place and why apexcharts >= 6 is required from this version on.
 *
 * The handful of convenience names below that upstream declares without
 * exporting are derived from exported types via indexed access, so they can
 * never drift again.
 */
export type {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexForecastDataPoints,
  ApexGrid,
  ApexLegend,
  ApexLocale,
  ApexMarkers,
  ApexNoData,
  ApexNonAxisChartSeries,
  ApexOptions,
  ApexParsing,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ImageAnnotations,
  PointAnnotations,
  TextAnnotations,
  XAxisAnnotations,
  YAxisAnnotations,
} from "apexcharts";

import type { ApexChart, XAxisAnnotations } from "apexcharts";

/** Union of chart types, derived from `ApexChart` so it always matches upstream. */
export type ChartType = NonNullable<ApexChart["type"]>;

/** Annotation label options; upstream declares this shape without exporting it. */
export type AnnotationLabel = NonNullable<XAxisAnnotations["label"]>;

/** Annotation label style options; upstream declares this shape without exporting it. */
export type AnnotationStyle = NonNullable<AnnotationLabel["style"]>;
