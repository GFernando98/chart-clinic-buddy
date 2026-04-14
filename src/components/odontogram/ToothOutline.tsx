import React from 'react';
import { ToothCondition } from '@/types';
import { getToothType, isUpperTooth, getConditionColor } from './toothUtils';

interface ToothOutlineProps {
  toothNumber: number;
  condition?: ToothCondition;
  isPresent?: boolean;
  size?: number;
}

/**
 * Anatomical tooth silhouette — single continuous SVG path per tooth type.
 * All paths drawn for LOWER orientation (crown on top, roots pointing down).
 * Upper teeth are flipped vertically via CSS transform.
 * Fill color changes based on tooth condition.
 */
export function ToothOutline({ toothNumber, condition = ToothCondition.Healthy, isPresent = true, size = 32 }: ToothOutlineProps) {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  // Not present / extracted
  if (!isPresent || condition === ToothCondition.Extracted) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size * 1.6, transform: isUpper ? 'scaleY(-1)' : 'none' }}
      >
        <svg width={size} height={size * 1.6} viewBox="0 0 40 64" fill="none">
          <path d={getToothPath(toothType)} fill="none" stroke="hsl(var(--muted-foreground) / 0.2)" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="10" y1="10" x2="30" y2="54" stroke="hsl(0 60% 50%)" strokeWidth="1.5" opacity="0.4" />
          <line x1="30" y1="10" x2="10" y2="54" stroke="hsl(0 60% 50%)" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
    );
  }

  // Determine fill color
  const fillColor = condition === ToothCondition.Healthy
    ? 'hsl(var(--muted-foreground) / 0.35)'
    : getConditionColor(condition);

  // For healthy teeth, use a subtle outline style. For conditions, use filled style.
  const isHealthy = condition === ToothCondition.Healthy;

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size * 1.6, transform: isUpper ? 'scaleY(-1)' : 'none' }}
    >
      <svg width={size} height={size * 1.6} viewBox="0 0 40 64" fill="none">
        <path
          d={getToothPath(toothType)}
          fill={fillColor}
          stroke={isHealthy ? 'hsl(var(--muted-foreground) / 0.25)' : 'hsl(var(--muted-foreground) / 0.4)'}
          strokeWidth={isHealthy ? '0.8' : '1'}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Returns SVG path for each tooth type.
 * Drawn in LOWER orientation: crown at top (y≈2-28), roots pointing down (y≈28-62).
 * ViewBox: 0 0 40 64
 */
function getToothPath(type: 'molar' | 'premolar' | 'canine' | 'incisor'): string {
  switch (type) {
    case 'molar':
      // Wide crown with 3 bumps, 2 roots splaying out
      return `
        M 5,24
        C 4,20 4,14 6,10
        C 8,6 11,3 14,2
        C 16,1 18,2 20,4
        C 22,2 24,1 26,2
        C 29,3 32,6 34,10
        C 36,14 36,20 35,24
        C 36,28 36,32 35,36
        C 34,40 32,44 30,48
        C 29,52 29,56 30,60
        C 30,62 29,63 28,62
        C 27,60 26,56 26,52
        C 26,48 25,44 24,40
        C 23,38 22,36 20,36
        C 18,36 17,38 16,40
        C 15,44 14,48 14,52
        C 14,56 13,60 12,62
        C 11,63 10,62 10,60
        C 11,56 11,52 10,48
        C 8,44 6,40 5,36
        C 4,32 4,28 5,24
        Z
      `;

    case 'premolar':
      // Medium crown with 2 bumps, 1 root (sometimes bifurcated)
      return `
        M 9,24
        C 8,20 8,14 10,10
        C 12,6 15,3 18,2
        C 19,1.5 21,1.5 22,2
        C 25,3 28,6 30,10
        C 32,14 32,20 31,24
        C 31,28 30,34 29,40
        C 28,46 27,52 27,56
        C 27,60 25,62 23,62
        C 21,62 20,60 20,56
        C 20,52 19,46 18,40
        C 17,34 16,28 15,24
        C 13,28 12,34 11,40
        C 10,46 10,52 10,56
        C 10,58 9,58 9,56
        C 9,52 9,46 9,40
        C 9,34 9,28 9,24
        Z
      `;

    case 'canine':
      // Narrow pointed crown, 1 long root
      return `
        M 13,22
        C 12,18 12,12 14,8
        C 16,4 18,2 20,1
        C 22,2 24,4 26,8
        C 28,12 28,18 27,22
        C 27,28 26,34 25,40
        C 24,46 23,52 22,56
        C 21,60 21,62 20,62
        C 19,62 19,60 18,56
        C 17,52 16,46 15,40
        C 14,34 13,28 13,22
        Z
      `;

    case 'incisor':
    default:
      // Narrow flat/rounded crown, 1 tapered root
      return `
        M 13,20
        C 12,16 13,10 15,6
        C 17,3 19,2 20,2
        C 21,2 23,3 25,6
        C 27,10 28,16 27,20
        C 27,26 26,32 25,38
        C 24,44 23,50 22,54
        C 21,58 21,60 20,60
        C 19,60 19,58 18,54
        C 17,50 16,44 15,38
        C 14,32 13,26 13,20
        Z
      `;
  }
}
