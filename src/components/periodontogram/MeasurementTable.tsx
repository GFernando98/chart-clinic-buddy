import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PERMANENT_TEETH, getToothType } from '@/components/odontogram/toothUtils';
import {
  PeriodontalMeasurement,
  PerioSurface,
  PerioPoint,
} from '@/types/periodontogram';

interface MeasurementTableProps {
  measurements: PeriodontalMeasurement[];
  missingTeeth: number[];
  jaw: 'upper' | 'lower';
}

const POINTS_ORDER: PerioPoint[] = [PerioPoint.Mesial, PerioPoint.Central, PerioPoint.Distal];

function getMeasurement(
  measurements: PeriodontalMeasurement[],
  tooth: number,
  surface: PerioSurface,
  point: PerioPoint
): PeriodontalMeasurement | undefined {
  return measurements.find(
    (m) => m.toothNumber === tooth && m.surface === surface && m.point === point
  );
}

function getProbingColor(value: number): string {
  if (value >= 5) return 'text-red-600 font-bold';
  if (value === 4) return 'text-amber-600 font-semibold';
  return '';
}

function getRecessionColor(value: number): string {
  if (value > 0) return 'text-amber-600';
  return '';
}

export function MeasurementTable({ measurements, missingTeeth, jaw }: MeasurementTableProps) {
  const teeth = jaw === 'upper' ? PERMANENT_TEETH.upper : PERMANENT_TEETH.lower;

  // Build data structure: for each tooth, 6 values (vestibular M/C/D then palatal M/C/D)
  const toothData = useMemo(() => {
    return teeth.map((toothNum) => {
      const isMissing = missingTeeth.includes(toothNum);
      const vestPoints = POINTS_ORDER.map((p) =>
        getMeasurement(measurements, toothNum, PerioSurface.Vestibular, p)
      );
      const palPoints = POINTS_ORDER.map((p) =>
        getMeasurement(measurements, toothNum, PerioSurface.PalatinoLingual, p)
      );
      const toothType = getToothType(toothNum);
      const hasFurcation = toothType === 'molar' || toothType === 'premolar';
      const mobility = vestPoints[0]?.mobility ?? palPoints[0]?.mobility ?? 0;
      const furcation = vestPoints[0]?.furcation ?? palPoints[0]?.furcation ?? null;

      return { toothNum, isMissing, vestPoints, palPoints, hasFurcation, mobility, furcation };
    });
  }, [teeth, measurements, missingTeeth]);

  const renderRow = (
    label: string,
    surface: 'vest' | 'pal',
    getValue: (m: PeriodontalMeasurement | undefined) => React.ReactNode,
    className?: string
  ) => (
    <tr className={cn('border-b border-border/50', className)}>
      <td className="sticky left-0 bg-background z-10 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap border-r">
        {label}
      </td>
      {toothData.map(({ toothNum, isMissing, vestPoints, palPoints }) => {
        const points = surface === 'vest' ? vestPoints : palPoints;
        return (
          <td key={toothNum} className={cn('px-0 py-1', isMissing && 'opacity-30')}>
            <div className="flex justify-center gap-0.5">
              {points.map((m, i) => (
                <span key={i} className="w-[22px] text-center text-xs">
                  {isMissing ? '—' : getValue(m)}
                </span>
              ))}
            </div>
          </td>
        );
      })}
    </tr>
  );

  const renderBleedingRow = (label: string, surface: 'vest' | 'pal') => (
    <tr className="border-b border-border/50">
      <td className="sticky left-0 bg-background z-10 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap border-r">
        {label}
      </td>
      {toothData.map(({ toothNum, isMissing, vestPoints, palPoints }) => {
        const points = surface === 'vest' ? vestPoints : palPoints;
        return (
          <td key={toothNum} className={cn('px-0 py-1', isMissing && 'opacity-30')}>
            <div className="flex justify-center gap-0.5">
              {points.map((m, i) => (
                <span key={i} className="w-[22px] flex justify-center">
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full inline-block',
                      m?.bleedingOnProbing ? 'bg-red-500' : 'border border-muted-foreground/40'
                    )}
                  />
                </span>
              ))}
            </div>
          </td>
        );
      })}
    </tr>
  );

  const renderPlaqueRow = (label: string, surface: 'vest' | 'pal') => (
    <tr className="border-b border-border/50">
      <td className="sticky left-0 bg-background z-10 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap border-r">
        {label}
      </td>
      {toothData.map(({ toothNum, isMissing, vestPoints, palPoints }) => {
        const points = surface === 'vest' ? vestPoints : palPoints;
        return (
          <td key={toothNum} className={cn('px-0 py-1', isMissing && 'opacity-30')}>
            <div className="flex justify-center gap-0.5">
              {points.map((m, i) => (
                <span key={i} className="w-[22px] flex justify-center">
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full inline-block',
                      m?.plaquePresent ? 'bg-yellow-500' : 'border border-muted-foreground/40'
                    )}
                  />
                </span>
              ))}
            </div>
          </td>
        );
      })}
    </tr>
  );

  // Zigzag SVG chart
  const chartHeight = 100;
  const chartYMax = 10;
  const colWidth = 70; // px per tooth
  const totalWidth = teeth.length * colWidth;

  const getYPos = (value: number) => {
    return (value / chartYMax) * chartHeight;
  };

  const buildPolyline = (surface: PerioSurface): string => {
    const points: string[] = [];
    teeth.forEach((toothNum, tIdx) => {
      const isMissing = missingTeeth.includes(toothNum);
      POINTS_ORDER.forEach((point, pIdx) => {
        const m = getMeasurement(measurements, toothNum, surface, point);
        const x = tIdx * colWidth + (colWidth / 4) * (pIdx + 0.5);
        const y = isMissing ? 0 : getYPos(m?.probingDepth ?? 0);
        points.push(`${x},${y}`);
      });
    });
    return points.join(' ');
  };

  const bleedingDots = (surface: PerioSurface) => {
    const dots: { x: number; y: number }[] = [];
    teeth.forEach((toothNum, tIdx) => {
      if (missingTeeth.includes(toothNum)) return;
      POINTS_ORDER.forEach((point, pIdx) => {
        const m = getMeasurement(measurements, toothNum, surface, point);
        if (m?.bleedingOnProbing) {
          const x = tIdx * colWidth + (colWidth / 4) * (pIdx + 0.5);
          const y = getYPos(m.probingDepth);
          dots.push({ x, y });
        }
      });
    });
    return dots;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm w-full min-w-max">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 bg-background z-10 px-3 py-2 text-left text-xs font-medium border-r w-[110px]" />
              {toothData.map(({ toothNum, isMissing }) => (
                <th
                  key={toothNum}
                  className={cn(
                    'px-0 py-2 text-center text-xs font-bold min-w-[70px]',
                    isMissing && 'opacity-30'
                  )}
                >
                  {toothNum}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Mobility */}
            <tr className="border-b border-border/50 bg-muted/30">
              <td className="sticky left-0 bg-muted/30 z-10 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap border-r">
                Movilidad
              </td>
              {toothData.map(({ toothNum, isMissing, mobility }) => (
                <td key={toothNum} className={cn('text-center text-xs py-1.5', isMissing && 'opacity-30')}>
                  {isMissing ? '—' : mobility > 0 ? `${['', 'I', 'II', 'III'][mobility]}` : '0'}
                </td>
              ))}
            </tr>

            {/* Furcation */}
            <tr className="border-b border-border/50 bg-muted/30">
              <td className="sticky left-0 bg-muted/30 z-10 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap border-r">
                Furcación
              </td>
              {toothData.map(({ toothNum, isMissing, hasFurcation, furcation }) => (
                <td key={toothNum} className={cn('text-center text-xs py-1.5', isMissing && 'opacity-30')}>
                  {isMissing ? '—' : !hasFurcation ? '—' : furcation != null && furcation > 0 ? `${['', 'I', 'II', 'III'][furcation]}` : '0'}
                </td>
              ))}
            </tr>

            {/* Vestibular section */}
            <tr className="bg-blue-50/50 dark:bg-blue-950/20">
              <td colSpan={teeth.length + 1} className="px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                Vestibular
              </td>
            </tr>

            {renderBleedingRow('Sangrado (V)', 'vest')}
            {renderPlaqueRow('Placa (V)', 'vest')}

            {renderRow('Sondaje (V)', 'vest', (m) => {
              const v = m?.probingDepth ?? 0;
              return <span className={getProbingColor(v)}>{v || '—'}</span>;
            })}

            {renderRow('Recesión (V)', 'vest', (m) => {
              const v = m?.gingivalRecession ?? 0;
              return <span className={getRecessionColor(v)}>{v || '0'}</span>;
            })}

            {renderRow('NIC (V)', 'vest', (m) => {
              const v = (m?.probingDepth ?? 0) + (m?.gingivalRecession ?? 0);
              return <span className="text-muted-foreground">{v || '0'}</span>;
            }, 'bg-muted/20')}

            {/* Palatino/Lingual section */}
            <tr className="bg-green-50/50 dark:bg-green-950/20">
              <td colSpan={teeth.length + 1} className="px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                Palatino / Lingual
              </td>
            </tr>

            {renderBleedingRow('Sangrado (P/L)', 'pal')}
            {renderPlaqueRow('Placa (P/L)', 'pal')}

            {renderRow('Sondaje (P/L)', 'pal', (m) => {
              const v = m?.probingDepth ?? 0;
              return <span className={getProbingColor(v)}>{v || '—'}</span>;
            })}

            {renderRow('Recesión (P/L)', 'pal', (m) => {
              const v = m?.gingivalRecession ?? 0;
              return <span className={getRecessionColor(v)}>{v || '0'}</span>;
            })}

            {renderRow('NIC (P/L)', 'pal', (m) => {
              const v = (m?.probingDepth ?? 0) + (m?.gingivalRecession ?? 0);
              return <span className="text-muted-foreground">{v || '0'}</span>;
            }, 'bg-muted/20')}
          </tbody>
        </table>
      </div>

      {/* Zigzag Chart */}
      {measurements.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-max p-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Gráfica de Sondaje — {jaw === 'upper' ? 'Superior' : 'Inferior'}
            </div>
            <svg width={totalWidth} height={chartHeight + 20} className="block">
              {/* Pathological zone (≥4mm) */}
              <rect
                x={0}
                y={0}
                width={totalWidth}
                height={getYPos(chartYMax) - getYPos(4)}
                fill="hsl(0 70% 50% / 0.08)"
              />
              <line
                x1={0}
                y1={getYPos(4)}
                x2={totalWidth}
                y2={getYPos(4)}
                stroke="hsl(0 70% 50% / 0.3)"
                strokeDasharray="4 2"
                strokeWidth={1}
              />
              <text x={2} y={getYPos(4) - 2} className="text-[8px] fill-red-400">
                4mm
              </text>

              {/* Grid lines */}
              {[2, 6, 8].map((v) => (
                <line
                  key={v}
                  x1={0}
                  y1={getYPos(v)}
                  x2={totalWidth}
                  y2={getYPos(v)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}

              {/* Vestibular line (blue) */}
              <polyline
                points={buildPolyline(PerioSurface.Vestibular)}
                fill="none"
                stroke="hsl(217 91% 60%)"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />

              {/* Palatino/Lingual line (green) */}
              <polyline
                points={buildPolyline(PerioSurface.PalatinoLingual)}
                fill="none"
                stroke="hsl(142 76% 36%)"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />

              {/* Bleeding dots - vestibular */}
              {bleedingDots(PerioSurface.Vestibular).map((dot, i) => (
                <circle key={`bv-${i}`} cx={dot.x} cy={dot.y} r={2.5} fill="hsl(0 72% 51%)" />
              ))}

              {/* Bleeding dots - palatal */}
              {bleedingDots(PerioSurface.PalatinoLingual).map((dot, i) => (
                <circle key={`bp-${i}`} cx={dot.x} cy={dot.y} r={2.5} fill="hsl(0 72% 51%)" />
              ))}

              {/* Y axis labels */}
              {[0, 2, 4, 6, 8, 10].map((v) => (
                <text
                  key={v}
                  x={totalWidth - 2}
                  y={getYPos(v) + 3}
                  textAnchor="end"
                  className="text-[7px] fill-muted-foreground"
                >
                  {v}
                </text>
              ))}

              {/* Legend */}
              <line x1={5} y1={chartHeight + 10} x2={20} y2={chartHeight + 10} stroke="hsl(217 91% 60%)" strokeWidth={2} />
              <text x={23} y={chartHeight + 13} className="text-[8px] fill-muted-foreground">Vestibular</text>
              <line x1={85} y1={chartHeight + 10} x2={100} y2={chartHeight + 10} stroke="hsl(142 76% 36%)" strokeWidth={2} />
              <text x={103} y={chartHeight + 13} className="text-[8px] fill-muted-foreground">Palatino/Lingual</text>
              <circle cx={185} cy={chartHeight + 10} r={3} fill="hsl(0 72% 51%)" />
              <text x={190} y={chartHeight + 13} className="text-[8px] fill-muted-foreground">Sangrado</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
