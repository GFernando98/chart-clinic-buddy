import React from 'react';
import { getToothType, isUpperTooth } from './toothUtils';

interface ToothOutlineProps {
  toothNumber: number;
  size?: number;
}

/**
 * Simple, clean tooth silhouette using basic geometric shapes.
 * Molars: 3 roots + wide crown. Premolars: 2 roots. Canine: 1 root + pointed crown. Incisor: 1 root + narrow crown.
 * Upper: roots up. Lower: flipped via CSS.
 */
export function ToothOutline({ toothNumber, size = 28 }: ToothOutlineProps) {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  const renderTooth = () => {
    switch (toothType) {
      case 'molar':
        return (
          <svg width={size} height={size * 1.3} viewBox="0 0 36 46">
            <rect x="5" y="0" width="4" height="18" rx="2" fill="currentColor" />
            <rect x="16" y="0" width="4" height="16" rx="2" fill="currentColor" />
            <rect x="27" y="0" width="4" height="18" rx="2" fill="currentColor" />
            <rect x="1" y="14" width="34" height="30" rx="5" fill="currentColor" />
          </svg>
        );
      case 'premolar':
        return (
          <svg width={size * 0.85} height={size * 1.3} viewBox="0 0 30 46">
            <rect x="6" y="0" width="4" height="18" rx="2" fill="currentColor" />
            <rect x="20" y="0" width="4" height="18" rx="2" fill="currentColor" />
            <rect x="2" y="14" width="26" height="30" rx="5" fill="currentColor" />
          </svg>
        );
      case 'canine':
        return (
          <svg width={size * 0.7} height={size * 1.4} viewBox="0 0 24 50">
            <rect x="9" y="0" width="5" height="24" rx="2.5" fill="currentColor" />
            <path d="M 12 16 C 4 24 2 32 3 38 C 4 44 8 48 12 48 C 16 48 20 44 21 38 C 22 32 20 24 12 16 Z" fill="currentColor" />
          </svg>
        );
      case 'incisor':
      default:
        return (
          <svg width={size * 0.65} height={size * 1.3} viewBox="0 0 22 46">
            <rect x="8" y="0" width="5" height="20" rx="2.5" fill="currentColor" />
            <rect x="2" y="16" width="18" height="28" rx="5" fill="currentColor" />
          </svg>
        );
    }
  };

  return (
    <div
      className="flex items-center justify-center text-muted-foreground/50"
      style={{ transform: isUpper ? 'none' : 'scaleY(-1)' }}
    >
      {renderTooth()}
    </div>
  );
}
