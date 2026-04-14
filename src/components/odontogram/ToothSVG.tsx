import React from 'react';
import { ToothCondition, ToothSurface, ToothRecord } from '@/types';
import { getToothType, getConditionColor, isUpperTooth } from './toothUtils';
import { cn } from '@/lib/utils';

interface ToothSVGProps {
  toothRecord: ToothRecord;
  isSelected: boolean;
  onToothClick: (toothNumber: number) => void;
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface) => void;
  size?: number;
}

/**
 * Anatomical tooth shapes rendered as SVG.
 * Each tooth type has a crown outline + root(s), with 5 interactive surface zones.
 * Upper teeth show roots above, lower teeth show roots below.
 */
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
    const surfaceRecord = surfaces.find((s) => s.surface === surface);
    return surfaceRecord?.condition || ToothCondition.Healthy;
  };

  const getSurfaceFill = (surface: ToothSurface): string => {
    const surfaceCondition = getSurfaceCondition(surface);
    if (surfaceCondition !== ToothCondition.Healthy) {
      return getConditionColor(surfaceCondition);
    }
    return 'hsl(0 0% 100%)';
  };

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (onSurfaceClick && isPresent) {
      onSurfaceClick(toothNumber, surface);
    }
  };

  const outlineColor =
    condition === ToothCondition.Healthy
      ? 'hsl(220 13% 70%)'
      : getConditionColor(condition);
  const hasCondition = condition !== ToothCondition.Healthy;
  const strokeW = hasCondition ? 2 : 1.2;

  // Viewbox is 50 wide x 80 tall: crown occupies middle 50x50, roots extend 30px above or below
  const vbW = 50;
  const vbH = 80;

  // ---- Extracted / Missing ----
  if (condition === ToothCondition.Extracted || !isPresent) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        {isUpper && (
          <span className="text-[10px] font-semibold text-muted-foreground leading-none">
            {toothNumber}
          </span>
        )}
        <svg
          width={size}
          height={size * 1.5}
          viewBox={`0 0 ${vbW} ${vbH}`}
          className={cn(
            'cursor-pointer transition-transform hover:scale-105',
            isSelected && 'drop-shadow-[0_0_4px_hsl(var(--primary))]'
          )}
          onClick={() => onToothClick(toothNumber)}
        >
          {/* Ghost crown */}
          <rect
            x="8"
            y={isUpper ? 30 : 5}
            width="34"
            height="40"
            rx="8"
            fill="hsl(220 9% 94%)"
            stroke="hsl(220 9% 75%)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* X mark */}
          <line
            x1="14"
            y1={isUpper ? 36 : 11}
            x2="36"
            y2={isUpper ? 64 : 39}
            stroke="hsl(220 9% 60%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="36"
            y1={isUpper ? 36 : 11}
            x2="14"
            y2={isUpper ? 64 : 39}
            stroke="hsl(220 9% 60%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        {!isUpper && (
          <span className="text-[10px] font-semibold text-muted-foreground leading-none">
            {toothNumber}
          </span>
        )}
      </div>
    );
  }

  // Helper to flip Y for upper/lower teeth
  // Design coordinates assume crown at bottom (lower tooth).
  // For upper teeth we flip vertically.
  const ty = (y: number) => (isUpper ? vbH - y : y);
  // For paths we build string directly with flipped coords

  // Surface paths depend on tooth type
  const renderCrown = () => {
    // Crown zone: y 30..70 (lower), flipped for upper
    // We define surfaces as path data for each tooth type
    const crownTop = ty(30);
    const crownBot = ty(70);
    const crownMidY = ty(50);
    const innerTop = ty(38);
    const innerBot = ty(62);

    // Determine center surface label
    const centerSurface =
      toothType === 'molar' || toothType === 'premolar'
        ? ToothSurface.Occlusal
        : ToothSurface.Incisal;

    // Buccal is the outer face (toward cheek), Lingual is inner (toward tongue)
    // For upper teeth: buccal = anatomical front = top of crown view
    // For lower teeth: buccal = front = top of crown view
    // In our 2D top-down view: top=buccal, bottom=lingual

    // Crown outline shape varies by tooth type
    let crownOutline: string;
    let leftX: number, rightX: number;

    switch (toothType) {
      case 'molar':
        leftX = 4;
        rightX = 46;
        crownOutline = buildRoundedRect(leftX, Math.min(crownTop, crownBot), rightX - leftX, Math.abs(crownBot - crownTop), 7);
        break;
      case 'premolar':
        leftX = 7;
        rightX = 43;
        crownOutline = buildRoundedRect(leftX, Math.min(crownTop, crownBot), rightX - leftX, Math.abs(crownBot - crownTop), 6);
        break;
      case 'canine':
        leftX = 12;
        rightX = 38;
        // Slightly pointed crown
        crownOutline = buildCanineCrown(leftX, rightX, crownTop, crownBot, isUpper);
        break;
      default: // incisor
        leftX = 13;
        rightX = 37;
        crownOutline = buildRoundedRect(leftX, Math.min(crownTop, crownBot), rightX - leftX, Math.abs(crownBot - crownTop), 5);
        break;
    }

    const innerLeft = leftX + 7;
    const innerRight = rightX - 7;
    const iTop = Math.min(innerTop, innerBot);
    const iBot = Math.max(innerTop, innerBot);
    const iH = iBot - iTop;

    return (
      <g>
        {/* Crown background fill */}
        <path d={crownOutline} fill="hsl(40 30% 97%)" stroke="none" />

        {/* Buccal surface (top band) */}
        <path
          d={buildTrapezoid(leftX, rightX, Math.min(crownTop, crownBot), iTop, innerLeft, innerRight)}
          fill={getSurfaceFill(ToothSurface.Buccal)}
          stroke={outlineColor}
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Buccal)}
        />

        {/* Lingual surface (bottom band) */}
        <path
          d={buildTrapezoid(leftX, rightX, Math.max(crownTop, crownBot), iBot, innerLeft, innerRight, true)}
          fill={getSurfaceFill(ToothSurface.Lingual)}
          stroke={outlineColor}
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Lingual)}
        />

        {/* Mesial surface (left band) */}
        <path
          d={`M ${leftX} ${Math.min(crownTop, crownBot)} L ${innerLeft} ${iTop} L ${innerLeft} ${iBot} L ${leftX} ${Math.max(crownTop, crownBot)} Z`}
          fill={getSurfaceFill(ToothSurface.Mesial)}
          stroke={outlineColor}
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Mesial)}
        />

        {/* Distal surface (right band) */}
        <path
          d={`M ${rightX} ${Math.min(crownTop, crownBot)} L ${innerRight} ${iTop} L ${innerRight} ${iBot} L ${rightX} ${Math.max(crownTop, crownBot)} Z`}
          fill={getSurfaceFill(ToothSurface.Distal)}
          stroke={outlineColor}
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Distal)}
        />

        {/* Center surface (Occlusal / Incisal) */}
        <rect
          x={innerLeft}
          y={iTop}
          width={innerRight - innerLeft}
          height={iH}
          rx={3}
          fill={getSurfaceFill(centerSurface)}
          stroke={outlineColor}
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => handleSurfaceClick(e, centerSurface)}
        />

        {/* Crown outline */}
        <path
          d={crownOutline}
          fill="none"
          stroke={outlineColor}
          strokeWidth={strokeW}
        />
      </g>
    );
  };

  const renderRoots = () => {
    // Roots extend from crown edge into the root zone
    // Lower teeth: roots go from y=70 down to y=80 (bottom)
    // Upper teeth: roots go from crown top upward
    const rootColor = 'hsl(35 25% 88%)';
    const rootStroke = 'hsl(220 13% 72%)';

    switch (toothType) {
      case 'molar':
        // 3 roots for molars
        return (
          <g>
            {/* Left root */}
            <path
              d={isUpper
                ? 'M 12 30 Q 10 18 8 6 Q 9 4 12 5 Q 14 16 16 30'
                : 'M 12 70 Q 10 78 8 90 Q 9 92 12 91 Q 14 80 16 70'}
              fill={rootColor}
              stroke={rootStroke}
              strokeWidth="1"
            />
            {/* Center root */}
            <path
              d={isUpper
                ? 'M 21 30 Q 24 15 25 3 Q 26 2 27 3 Q 28 15 30 30'
                : 'M 21 70 Q 24 82 25 93 Q 26 94 27 93 Q 28 82 30 70'}
              fill={rootColor}
              stroke={rootStroke}
              strokeWidth="1"
            />
            {/* Right root */}
            <path
              d={isUpper
                ? 'M 34 30 Q 36 18 40 8 Q 41 6 42 8 Q 40 20 38 30'
                : 'M 34 70 Q 36 78 40 88 Q 41 90 42 88 Q 40 78 38 70'}
              fill={rootColor}
              stroke={rootStroke}
              strokeWidth="1"
            />
          </g>
        );
      case 'premolar':
        // 2 roots
        return (
          <g>
            <path
              d={isUpper
                ? 'M 15 30 Q 14 18 13 7 Q 14 5 16 7 Q 17 18 19 30'
                : 'M 15 70 Q 14 80 13 89 Q 14 91 16 89 Q 17 80 19 70'}
              fill={rootColor}
              stroke={rootStroke}
              strokeWidth="1"
            />
            <path
              d={isUpper
                ? 'M 31 30 Q 33 18 35 7 Q 36 5 37 7 Q 36 18 34 30'
                : 'M 31 70 Q 33 80 35 89 Q 36 91 37 89 Q 36 80 34 70'}
              fill={rootColor}
              stroke={rootStroke}
              strokeWidth="1"
            />
          </g>
        );
      case 'canine':
        // 1 long root
        return (
          <path
            d={isUpper
              ? 'M 21 30 Q 23 14 25 2 Q 26 1 27 2 Q 28 14 29 30'
              : 'M 21 70 Q 23 84 25 94 Q 26 95 27 94 Q 28 84 29 70'}
            fill={rootColor}
            stroke={rootStroke}
            strokeWidth="1"
          />
        );
      default:
        // incisor - 1 root
        return (
          <path
            d={isUpper
              ? 'M 22 30 Q 23 18 25 5 Q 26 4 27 5 Q 28 18 28 30'
              : 'M 22 70 Q 23 80 25 91 Q 26 92 27 91 Q 28 80 28 70'}
            fill={rootColor}
            stroke={rootStroke}
            strokeWidth="1"
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-0">
      {isUpper && (
        <span className="text-[10px] font-semibold text-muted-foreground leading-none mb-0.5">
          {toothNumber}
        </span>
      )}
      <svg
        width={size}
        height={size * 1.5}
        viewBox={`0 0 ${vbW} ${vbH + 16}`}
        className={cn(
          'cursor-pointer transition-transform hover:scale-105',
          isSelected && 'drop-shadow-[0_0_6px_hsl(var(--primary))]'
        )}
        onClick={() => onToothClick(toothNumber)}
      >
        <g transform={`translate(0, 8)`}>
          {/* Render roots behind the crown */}
          {renderRoots()}
          {/* Crown with interactive surfaces */}
          {renderCrown()}
        </g>

        {/* Selection indicator */}
        {isSelected && (
          <rect
            x="1"
            y="1"
            width={vbW - 2}
            height={vbH + 14}
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

// --- Utility functions for SVG path generation ---

function buildRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  r = Math.min(r, w / 2, h / 2);
  return `M ${x + r} ${y}
    L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r}
    L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h}
    L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r}
    L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

function buildCanineCrown(
  leftX: number,
  rightX: number,
  crownTop: number,
  crownBot: number,
  isUpper: boolean
): string {
  const midX = (leftX + rightX) / 2;
  const top = Math.min(crownTop, crownBot);
  const bot = Math.max(crownTop, crownBot);
  const h = bot - top;

  // Canine has a pointed tip
  if (isUpper) {
    // Point at bottom (tip of tooth faces down for upper)
    return `M ${midX} ${bot + 3}
      Q ${leftX - 2} ${bot - h * 0.3} ${leftX} ${top + 5}
      Q ${leftX + 1} ${top} ${midX} ${top}
      Q ${rightX - 1} ${top} ${rightX} ${top + 5}
      Q ${rightX + 2} ${bot - h * 0.3} ${midX} ${bot + 3} Z`;
  } else {
    // Point at top (tip of tooth faces up for lower)
    return `M ${midX} ${top - 3}
      Q ${leftX - 2} ${top + h * 0.3} ${leftX} ${bot - 5}
      Q ${leftX + 1} ${bot} ${midX} ${bot}
      Q ${rightX - 1} ${bot} ${rightX} ${bot - 5}
      Q ${rightX + 2} ${top + h * 0.3} ${midX} ${top - 3} Z`;
  }
}

function buildTrapezoid(
  outerLeft: number,
  outerRight: number,
  outerY: number,
  innerY: number,
  innerLeft: number,
  innerRight: number,
  flip = false
): string {
  if (flip) {
    return `M ${outerLeft} ${outerY} L ${innerLeft} ${innerY} L ${innerRight} ${innerY} L ${outerRight} ${outerY} Z`;
  }
  return `M ${outerLeft} ${outerY} L ${outerRight} ${outerY} L ${innerRight} ${innerY} L ${innerLeft} ${innerY} Z`;
}
