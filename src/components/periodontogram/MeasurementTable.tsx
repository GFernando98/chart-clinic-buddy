import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PERMANENT_TEETH, getToothType } from '@/components/odontogram/toothUtils';
import {
  PeriodontalMeasurement,
  PerioSurface,
  PerioPoint,
  MobilityGrade,
  FurcationGrade,
} from '@/types/periodontogram';

interface MeasurementTableProps {
  measurements: PeriodontalMeasurement[];
  missingTeeth: number[];
  jaw: 'upper' | 'lower';
}

const POINTS_ORDER: PerioPoint[] = ['Mesial', 'Central', 'Distal'];

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

const MOBILITY_LABELS: Record<string, string> = {
  None: '0',
  GradeI: 'I',
  GradeII: 'II',
  GradeIII: 'III',
};

const FURCATION_LABELS: Record<string, string> = {
  None: '0',
  GradeI: 'I',
  GradeII: 'II',
  GradeIII: 'III',
};

export function MeasurementTable({ measurements, missingTeeth, jaw }: MeasurementTableProps) {
  const teeth = jaw === 'upper' ? PERMANENT_TEETH.upper : PERMANENT_TEETH.lower;

  const toothData = useMemo(() => {
    return teeth.map((toothNum) => {
      const isMissing = missingTeeth.includes(toothNum);
      const vestPoints = POINTS_ORDER.map((p) =>
        getMeasurement(measurements, toothNum, 'Vestibular', p)
      );
      const palPoints = POINTS_ORDER.map((p) =>
        getMeasurement(measurements, toothNum, 'LingualPalatine', p)
      );
      const toothType = getToothType(toothNum);
      const hasFurcation = toothType === 'molar' || toothType === 'premolar';
      const mobility: MobilityGrade = vestPoints[0]?.mobility ?? palPoints[0]?.mobility ?? 'None';
      const furcation: FurcationGrade | null = vestPoints[0]?.furcation ?? palPoints[0]?.furcation ?? null;

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
                      m?.bleeding ? 'bg-red-500' : 'border border-muted-foreground/40'
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
                      m?.plaque ? 'bg-yellow-500' : 'border border-muted-foreground/40'
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
  const chartHeight = 160;
  const chartYMax = 10;
  const colWidth = 70;
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
        if (m?.bleeding) {
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
                  {isMissing ? '—' : MOBILITY_LABELS[mobility] || '0'}
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
                  {isMissing ? '—' : !hasFurcation ? '—' : furcation ? FURCATION_LABELS[furcation] || '0' : '0'}
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
              const v = m?.recession ?? 0;
              return <span className={getRecessionColor(v)}>{v || '0'}</span>;
            })}

            {renderRow('NIC (V)', 'vest', (m) => {
              const v = (m?.probingDepth ?? 0) + (m?.recession ?? 0);
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
              const v = m?.recession ?? 0;
              return <span className={getRecessionColor(v)}>{v || '0'}</span>;
            })}

            {renderRow('NIC (P/L)', 'pal', (m) => {
              const v = (m?.probingDepth ?? 0) + (m?.recession ?? 0);
              return <span className="text-muted-foreground">{v || '0'}</span>;
            }, 'bg-muted/20')}
          </tbody>
        </table>
      </div>

      {/* Zigzag Chart */}
      {measurements.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-max p-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Gráfica de Sondaje — {jaw === 'upper' ? 'Superior' : 'Inferior'}
            </div>
            <svg width={totalWidth} height={chartHeight + 35} className="block">
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
              <text x={2} y={getYPos(4) - 4} className="text-xs fill-red-400 font-medium">
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
                points={buildPolyline('Vestibular')}
                fill="none"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                strokeLinejoin="round"
              />

              {/* Palatino/Lingual line (green) */}
              <polyline
                points={buildPolyline('LingualPalatine')}
                fill="none"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                strokeLinejoin="round"
              />

              {/* Bleeding dots - vestibular */}
              {bleedingDots('Vestibular').map((dot, i) => (
                <circle key={`bv-${i}`} cx={dot.x} cy={dot.y} r={4} fill="hsl(0 72% 51%)" />
              ))}

              {/* Bleeding dots - palatal */}
              {bleedingDots('LingualPalatine').map((dot, i) => (
                <circle key={`bp-${i}`} cx={dot.x} cy={dot.y} r={4} fill="hsl(0 72% 51%)" />
              ))}

              {/* Y axis labels */}
              {[0, 2, 4, 6, 8, 10].map((v) => (
                <text
                  key={v}
                  x={totalWidth - 4}
                  y={getYPos(v) + 5}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {v}
                </text>
              ))}

              {/* Legend */}
              <line x1={10} y1={chartHeight + 22} x2={35} y2={chartHeight + 22} stroke="hsl(217 91% 60%)" strokeWidth={3} />
              <text x={40} y={chartHeight + 26} className="text-xs fill-muted-foreground">Vestibular</text>
              <line x1={130} y1={chartHeight + 22} x2={155} y2={chartHeight + 22} stroke="hsl(142 76% 36%)" strokeWidth={3} />
              <text x={160} y={chartHeight + 26} className="text-xs fill-muted-foreground">Palatino/Lingual</text>
              <circle cx={280} cy={chartHeight + 22} r={4} fill="hsl(0 72% 51%)" />
              <text x={288} y={chartHeight + 26} className="text-xs fill-muted-foreground">Sangrado</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
