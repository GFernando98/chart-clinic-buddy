import React from 'react';
import { ToothCondition, ToothSurface, ToothRecord, ToothSurfaceRecord } from '@/types';
import { getToothType, getConditionColor, isUpperTooth } from './toothUtils';
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
  size = 50 
}: ToothSVGProps) {
  const { toothNumber, condition, isPresent, surfaces } = toothRecord;
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);
  
  const getSurfaceCondition = (surface: ToothSurface): ToothCondition => {
    const surfaceRecord = surfaces.find(s => s.surface === surface);
    return surfaceRecord?.condition || ToothCondition.Healthy;
  };

  const getSurfaceFill = (surface: ToothSurface): string => {
    const surfaceCondition = getSurfaceCondition(surface);
    if (surfaceCondition !== ToothCondition.Healthy) {
      return getConditionColor(surfaceCondition);
    }
    // If no surface-specific condition, use tooth's general condition for display
    if (condition !== ToothCondition.Healthy && condition !== ToothCondition.Missing && condition !== ToothCondition.Extracted) {
      return 'hsl(0 0% 100%)'; // White for surfaces on conditioned teeth
    }
    return 'hsl(0 0% 100%)';
  };

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (onSurfaceClick && isPresent) {
      onSurfaceClick(toothNumber, surface);
    }
  };

  // Render extracted tooth with X mark
  if (condition === ToothCondition.Extracted || !isPresent) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 50 50"
          className={cn(
            'cursor-pointer transition-transform hover:scale-110',
            isSelected && 'ring-2 ring-primary ring-offset-2 rounded'
          )}
          onClick={() => onToothClick(toothNumber)}
        >
          <rect
            x="5"
            y="5"
            width="40"
            height="40"
            rx="4"
            fill="hsl(220 9% 90%)"
            stroke="hsl(220 9% 60%)"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <line x1="10" y1="10" x2="40" y2="40" stroke="hsl(220 9% 50%)" strokeWidth="3" />
          <line x1="40" y1="10" x2="10" y2="40" stroke="hsl(220 9% 50%)" strokeWidth="3" />
        </svg>
        <span className={cn(
          'text-xs font-medium',
          isUpper ? 'order-first' : 'order-last'
        )}>
          {toothNumber}
        </span>
      </div>
    );
  }

  // Get tooth outline color based on condition
  const getOutlineColor = () => {
    if (condition === ToothCondition.Healthy) return 'hsl(220 13% 70%)';
    return getConditionColor(condition);
  };

  const outlineColor = getOutlineColor();
  const hasCondition = condition !== ToothCondition.Healthy;

  // Render molar/premolar (5 surfaces)
  if (toothType === 'molar' || toothType === 'premolar') {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 50 50"
          className={cn(
            'cursor-pointer transition-transform hover:scale-110',
            isSelected && 'ring-2 ring-primary ring-offset-2 rounded'
          )}
          onClick={() => onToothClick(toothNumber)}
        >
          {/* Outer border */}
          <rect
            x="2"
            y="2"
            width="46"
            height="46"
            rx="6"
            fill="none"
            stroke={outlineColor}
            strokeWidth={hasCondition ? 3 : 2}
          />
          
          {/* Buccal (top) */}
          <path
            d="M 2 2 L 48 2 L 40 12 L 10 12 Z"
            fill={getSurfaceFill(ToothSurface.Buccal)}
            stroke={outlineColor}
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Buccal)}
          />
          
          {/* Lingual (bottom) */}
          <path
            d="M 2 48 L 10 38 L 40 38 L 48 48 Z"
            fill={getSurfaceFill(ToothSurface.Lingual)}
            stroke={outlineColor}
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Lingual)}
          />
          
          {/* Mesial (left) */}
          <path
            d="M 2 2 L 10 12 L 10 38 L 2 48 Z"
            fill={getSurfaceFill(ToothSurface.Mesial)}
            stroke={outlineColor}
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Mesial)}
          />
          
          {/* Distal (right) */}
          <path
            d="M 48 2 L 48 48 L 40 38 L 40 12 Z"
            fill={getSurfaceFill(ToothSurface.Distal)}
            stroke={outlineColor}
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Distal)}
          />
          
          {/* Occlusal (center) */}
          <rect
            x="10"
            y="12"
            width="30"
            height="26"
            fill={getSurfaceFill(ToothSurface.Occlusal)}
            stroke={outlineColor}
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => handleSurfaceClick(e, ToothSurface.Occlusal)}
          />
        </svg>
        <span className={cn(
          'text-xs font-medium',
          isUpper ? 'order-first' : 'order-last'
        )}>
          {toothNumber}
        </span>
      </div>
    );
  }

  // Render incisor/canine (4 surfaces + incisal edge)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50"
        className={cn(
          'cursor-pointer transition-transform hover:scale-110',
          isSelected && 'ring-2 ring-primary ring-offset-2 rounded'
        )}
        onClick={() => onToothClick(toothNumber)}
      >
        {/* Outer border - more narrow for incisors */}
        <rect
          x="8"
          y="2"
          width="34"
          height="46"
          rx="4"
          fill="none"
          stroke={outlineColor}
          strokeWidth={hasCondition ? 3 : 2}
        />
        
        {/* Buccal (top/front) */}
        <path
          d="M 8 2 L 42 2 L 36 12 L 14 12 Z"
          fill={getSurfaceFill(ToothSurface.Buccal)}
          stroke={outlineColor}
          strokeWidth="1"
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Buccal)}
        />
        
        {/* Lingual (bottom/back) */}
        <path
          d="M 8 48 L 14 38 L 36 38 L 42 48 Z"
          fill={getSurfaceFill(ToothSurface.Lingual)}
          stroke={outlineColor}
          strokeWidth="1"
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Lingual)}
        />
        
        {/* Mesial (left) */}
        <path
          d="M 8 2 L 14 12 L 14 38 L 8 48 Z"
          fill={getSurfaceFill(ToothSurface.Mesial)}
          stroke={outlineColor}
          strokeWidth="1"
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Mesial)}
        />
        
        {/* Distal (right) */}
        <path
          d="M 42 2 L 42 48 L 36 38 L 36 12 Z"
          fill={getSurfaceFill(ToothSurface.Distal)}
          stroke={outlineColor}
          strokeWidth="1"
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Distal)}
        />
        
        {/* Incisal (center) */}
        <rect
          x="14"
          y="12"
          width="22"
          height="26"
          fill={getSurfaceFill(ToothSurface.Incisal)}
          stroke={outlineColor}
          strokeWidth="1"
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => handleSurfaceClick(e, ToothSurface.Incisal)}
        />
      </svg>
      <span className={cn(
        'text-xs font-medium',
        isUpper ? 'order-first' : 'order-last'
      )}>
        {toothNumber}
      </span>
    </div>
  );
}
