import React from 'react';
import { getToothType, isUpperTooth } from './toothUtils';

interface ToothOutlineProps {
  toothNumber: number;
  size?: number;
}

/**
 * Decorative anatomical tooth silhouette (non-interactive).
 * Renders a recognizable tooth shape based on its FDI type.
 * Upper teeth show roots pointing up; lower teeth show roots pointing down.
 */
export function ToothOutline({ toothNumber, size = 32 }: ToothOutlineProps) {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  // All paths drawn for UPPER orientation (roots up, crown down).
  // For lower teeth we flip via transform.
  const getPath = (): string => {
    switch (toothType) {
      case 'molar':
        return `
          M 14,58 C 14,56 10,54 8,50 C 6,46 6,42 8,40
          C 6,38 4,34 6,28 C 7,24 8,22 10,20
          C 11,16 10,10 9,4 C 9,2 11,1 12,3 C 13,8 14,14 15,20
          C 17,18 20,17 22,17
          C 24,17 26,18 28,20
          C 29,14 30,8 31,3 C 31,1 33,1 33,3 C 33,8 34,14 35,20
          C 36,18 38,17 40,17
          C 42,17 44,18 46,20
          C 47,14 48,8 49,3 C 49,1 51,1 51,3 C 51,8 50,14 49,20
          C 51,22 53,26 54,30
          C 55,34 54,38 52,40
          C 54,44 54,48 52,52 C 50,56 46,58 42,59
          C 38,60 34,60 30,60 C 26,60 22,60 18,59 C 14,58 14,58 14,58 Z
        `;
      case 'premolar':
        return `
          M 18,58 C 16,56 14,52 14,48
          C 12,44 12,40 14,36
          C 13,30 12,22 11,14 C 10,6 10,3 12,2 C 14,1 15,3 16,8
          C 17,14 18,22 20,30
          C 22,26 26,24 30,24
          C 34,24 38,26 40,30
          C 42,22 43,14 44,8 C 45,3 46,1 48,2 C 50,3 50,6 49,14
          C 48,22 47,30 46,36
          C 48,40 48,44 46,48
          C 44,52 42,56 40,58
          C 36,60 24,60 18,58 Z
        `;
      case 'canine':
        return `
          M 22,58 C 20,56 18,52 18,46
          C 16,40 16,34 18,28
          C 17,22 16,14 15,8 C 14,4 14,2 16,1
          C 18,0 20,2 22,8 C 24,14 26,20 28,26
          C 30,22 32,16 34,10 C 36,4 38,0 40,1
          C 42,2 42,4 41,8 C 40,14 39,22 38,28
          C 40,34 40,40 38,46
          C 36,52 34,56 32,58
          C 28,60 26,60 22,58 Z
        `;
      case 'incisor':
      default:
        return `
          M 22,56 C 20,54 18,50 18,44
          C 16,38 16,32 18,26
          C 17,20 16,14 15,8 C 14,4 15,2 17,1
          C 19,0 21,2 23,8 C 25,14 27,20 29,26
          C 30,22 32,16 34,10 C 36,4 37,2 39,1
          C 41,0 43,2 42,6 C 41,10 40,16 39,22
          C 40,26 42,32 42,38
          C 42,44 40,50 38,54
          C 36,56 34,58 30,58
          C 26,58 24,58 22,56 Z
        `;
    }
  };

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 60 62"
      className="opacity-60"
      style={{
        transform: isUpper ? 'none' : 'scaleY(-1)',
      }}
    >
      <path
        d={getPath()}
        fill="currentColor"
        stroke="none"
        className="text-muted-foreground/40"
      />
    </svg>
  );
}
