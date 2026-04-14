import React from 'react';
import { ToothCondition, ToothSurface, ToothRecord } from '@/types';
import { getToothType, getConditionColor, isUpperTooth } from './toothUtils';
import { getToothPaths } from './toothPaths';
import { cn } from '@/lib/utils';

interface ToothSVGProps {
  toothRecord: ToothRecord;
  isSelected: boolean;
  onToothClick: (toothNumber: number) => void;
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface) => void;
  size?: number;
}

export function ToothSVG({
  toothRecord,
  isSelected,
  onToothClick,
  onSurfaceClick,
  size = 50,
}: ToothSVGProps) {
  const { toothNumber, condition, isPresent, surfaces } = toothRecord;
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  const getSurfaceCondition = (surface: ToothSurface): ToothCondition => {
    const rec = surfaces.find((s) => s.surface === surface);
    return rec?.condition || ToothCondition.Healthy;
  };

  const getSurfaceFill = (surface: ToothSurface): string => {
    const c = getSurfaceCondition(surface);
    return c !== ToothCondition.Healthy ? getConditionColor(c) : 'hsl(0 0% 100%)';
  };

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (onSurfaceClick && isPresent) onSurfaceClick(toothNumber, surface);
  };

  const outlineColor =
    condition === ToothCondition.Healthy
      ? 'hsl(215 15% 65%)'
      : getConditionColor(condition);
  const hasCondition = condition !== ToothCondition.Healthy;
  const strokeW = hasCondition ? 2.2 : 1.4;

  const paths = getToothPaths(toothType, isUpper);
  const [cx, cy, cw, ch] = paths.crownBox;

  // Surface geometry: 5-zone cross pattern inside the crown bounding box
  const margin = 2;
  const sx = cx + margin;
  const sy = cy + margin;
  const sw = cw - margin * 2;
  const sh = ch - margin * 2;
  const innerMargin = Math.min(sw, sh) * 0.22;
  const ix = sx + innerMargin;
  const iy = sy + innerMargin;
  const iw = sw - innerMargin * 2;
  const ih = sh - innerMargin * 2;

  const centerSurface =
    toothType === 'molar' || toothType === 'premolar'
      ? ToothSurface.Occlusal
      : ToothSurface.Incisal;

  // ---- Extracted / Missing ----
  if (condition === ToothCondition.Extracted || !isPresent) {
    return (
      <div className="flex flex-col items-center">
        {isUpper && (
          <span className="text-[10px] font-semibold text-muted-foreground leading-none mb-0.5">
            {toothNumber}
          </span>
        )}
        <svg
          width={size * 0.72}
          height={size * 1.2}
          viewBox="0 0 56 100"
          className={cn(
            'cursor-pointer transition-transform hover:scale-105',
            isSelected && 'drop-shadow-[0_0_4px_hsl(var(--primary))]'
          )}
          onClick={() => onToothClick(toothNumber)}
        >
          <path
            d={paths.outline}
            fill="hsl(220 10% 92%)"
            stroke="hsl(220 10% 75%)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.5"
          />
          {/* X mark */}
          <line
            x1={cx + 4}
            y1={cy + 4}
            x2={cx + cw - 4}
            y2={cy + ch - 4}
            stroke="hsl(0 60% 50%)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1={cx + cw - 4}
            y1={cy + 4}
            x2={cx + 4}
            y2={cy + ch - 4}
            stroke="hsl(0 60% 50%)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
        {!isUpper && (
          <span className="text-[10px] font-semibold text-muted-foreground leading-none mt-0.5">
            {toothNumber}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isUpper && (
        <span className="text-[10px] font-semibold text-muted-foreground leading-none mb-0.5">
          {toothNumber}
        </span>
      )}
      <svg
        width={size * 0.72}
        height={size * 1.2}
        viewBox="0 0 56 100"
        className={cn(
          'cursor-pointer transition-transform hover:scale-105',
          isSelected && 'drop-shadow-[0_0_6px_hsl(var(--primary))]'
        )}
        onClick={() => onToothClick(toothNumber)}
      >
        {/* Tooth silhouette (roots + crown outline) */}
        <path
          d={paths.outline}
          fill="hsl(40 30% 97%)"
          stroke={outlineColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />

        {/* Crown fill on top */}
        <path
          d={paths.crown}
          fill="hsl(0 0% 100%)"
          stroke={outlineColor}
          strokeWidth={strokeW * 0.8}
          strokeLinejoin="round"
        />

        {/* ── Interactive 5-surface cross overlay ── */}
        {/* Clip to crown shape */}
        <defs>
          <clipPath id={`crown-clip-${toothNumber}`}>
            <path d={paths.crown} />
          </clipPath>
        </defs>

        <g clipPath={`url(#crown-clip-${toothNumber})`}>
          {/* Buccal (top for lower, bottom for upper) */}
          <path
            d={`M ${sx} ${sy} L ${sx + sw} ${sy} L ${ix + iw} ${iy} L ${ix} ${iy} Z`}
            fill={getSurfaceFill(isUpper ? ToothSurface.Lingual : ToothSurface.Buccal)}
            stroke={outlineColor}
            strokeWidth="0.7"
            className="cursor-pointer hover:brightness-90 transition-all"
            onClick={(e) => handleSurfaceClick(e, isUpper ? ToothSurface.Lingual : ToothSurface.Buccal)}
          />

          {/* Lingual (bottom for lower, top for upper) */}
          <path
            d={`M ${sx} ${sy + sh} L ${ix} ${iy + ih} L ${ix + iw} ${iy + ih} L ${sx + sw} ${sy + sh} Z`}
            fill={getSurfaceFill(isUpper ? ToothSurface.Buccal : ToothSurface.Lingual)}
            stroke={outlineColor}
            strokeWidth="0.7"
            className="cursor-pointer hover:brightness-90 transition-all"
            onClick={(e) => handleSurfaceClick(e, isUpper ? ToothSurface.Buccal : ToothSurface.Lingual)}
          />

          {/* Mesial (left) */}
          <path
            d={`M ${sx} ${sy} L ${ix} ${iy} L ${ix} ${iy + ih} L ${sx} ${sy + sh} Z`}
            fill={getSurfaceFill(ToothSurface.Mesial)}
            stroke={outlineColor}
            strokeWidth="0.7"
            className="cursor-pointer hover:brightness-90 transition-all"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Mesial)}
          />

          {/* Distal (right) */}
          <path
            d={`M ${sx + sw} ${sy} L ${sx + sw} ${sy + sh} L ${ix + iw} ${iy + ih} L ${ix + iw} ${iy} Z`}
            fill={getSurfaceFill(ToothSurface.Distal)}
            stroke={outlineColor}
            strokeWidth="0.7"
            className="cursor-pointer hover:brightness-90 transition-all"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Distal)}
          />

          {/* Center (Occlusal/Incisal) */}
          <rect
            x={ix}
            y={iy}
            width={iw}
            height={ih}
            rx={2}
            fill={getSurfaceFill(centerSurface)}
            stroke={outlineColor}
            strokeWidth="0.7"
            className="cursor-pointer hover:brightness-90 transition-all"
            onClick={(e) => handleSurfaceClick(e, centerSurface)}
          />
        </g>

        {/* Selection ring */}
        {isSelected && (
          <rect
            x="1"
            y="1"
            width="54"
            height="98"
            rx="6"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
      </svg>
      {!isUpper && (
        <span className="text-[10px] font-semibold text-muted-foreground leading-none mt-0.5">
          {toothNumber}
        </span>
      )}
    </div>
  );
}
