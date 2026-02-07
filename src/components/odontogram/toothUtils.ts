import { ToothCondition, ToothSurface } from '@/types';

// FDI Tooth Numbering - Permanent teeth positions
export const PERMANENT_TEETH = {
  upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

// FDI Tooth Numbering - Deciduous teeth positions
export const DECIDUOUS_TEETH = {
  upper: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  lower: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
};

// Tooth types by FDI number
export const getToothType = (toothNumber: number): 'molar' | 'premolar' | 'canine' | 'incisor' => {
  const lastDigit = toothNumber % 10;
  
  // Permanent teeth
  if (toothNumber < 60) {
    if (lastDigit >= 6 && lastDigit <= 8) return 'molar';
    if (lastDigit >= 4 && lastDigit <= 5) return 'premolar';
    if (lastDigit === 3) return 'canine';
    return 'incisor';
  }
  
  // Deciduous teeth
  if (lastDigit >= 4 && lastDigit <= 5) return 'molar';
  if (lastDigit === 3) return 'canine';
  return 'incisor';
};

// Surfaces available for each tooth type
export const getSurfacesForTooth = (toothNumber: number): ToothSurface[] => {
  const type = getToothType(toothNumber);
  
  // Incisors and canines have Incisal instead of Occlusal
  if (type === 'incisor' || type === 'canine') {
    return [
      ToothSurface.Mesial,
      ToothSurface.Distal,
      ToothSurface.Buccal,
      ToothSurface.Lingual,
      ToothSurface.Incisal,
    ];
  }
  
  // Molars and premolars have Occlusal
  return [
    ToothSurface.Mesial,
    ToothSurface.Distal,
    ToothSurface.Buccal,
    ToothSurface.Lingual,
    ToothSurface.Occlusal,
  ];
};

// Color mapping for tooth conditions
export const CONDITION_COLORS: Record<ToothCondition, string> = {
  [ToothCondition.Healthy]: 'var(--tooth-healthy)',
  [ToothCondition.Decayed]: 'var(--tooth-decayed)',
  [ToothCondition.Filled]: 'var(--tooth-filled)',
  [ToothCondition.Missing]: 'var(--tooth-missing)',
  [ToothCondition.Extracted]: 'var(--tooth-extracted)',
  [ToothCondition.Crown]: 'var(--tooth-crown)',
  [ToothCondition.Bridge]: 'var(--tooth-bridge)',
  [ToothCondition.Implant]: 'var(--tooth-implant)',
  [ToothCondition.RootCanal]: 'var(--tooth-rootcanal)',
  [ToothCondition.Fracture]: 'var(--tooth-fracture)',
  [ToothCondition.Sealant]: 'var(--tooth-sealant)',
  [ToothCondition.Prosthesis]: 'var(--tooth-prosthesis)',
};

// Get the actual HSL color value
export const getConditionColor = (condition: ToothCondition): string => {
  const colorMap: Record<ToothCondition, string> = {
    [ToothCondition.Healthy]: 'hsl(0 0% 100%)',
    [ToothCondition.Decayed]: 'hsl(0 72% 51%)',
    [ToothCondition.Filled]: 'hsl(217 91% 60%)',
    [ToothCondition.Missing]: 'hsl(220 9% 80%)',
    [ToothCondition.Extracted]: 'hsl(220 9% 60%)',
    [ToothCondition.Crown]: 'hsl(45 93% 47%)',
    [ToothCondition.Bridge]: 'hsl(25 95% 53%)',
    [ToothCondition.Implant]: 'hsl(271 81% 56%)',
    [ToothCondition.RootCanal]: 'hsl(330 81% 60%)',
    [ToothCondition.Fracture]: 'hsl(24 95% 53%)',
    [ToothCondition.Sealant]: 'hsl(160 84% 39%)',
    [ToothCondition.Prosthesis]: 'hsl(239 84% 67%)',
  };
  return colorMap[condition];
};

// Surface labels
export const SURFACE_LABELS: Record<ToothSurface, { es: string; en: string; short: string }> = {
  [ToothSurface.Mesial]: { es: 'Mesial', en: 'Mesial', short: 'M' },
  [ToothSurface.Distal]: { es: 'Distal', en: 'Distal', short: 'D' },
  [ToothSurface.Buccal]: { es: 'Vestibular', en: 'Buccal', short: 'V' },
  [ToothSurface.Lingual]: { es: 'Lingual', en: 'Lingual', short: 'L' },
  [ToothSurface.Occlusal]: { es: 'Oclusal', en: 'Occlusal', short: 'O' },
  [ToothSurface.Incisal]: { es: 'Incisal', en: 'Incisal', short: 'I' },
};

// Condition labels
export const CONDITION_LABELS: Record<ToothCondition, { es: string; en: string }> = {
  [ToothCondition.Healthy]: { es: 'Sano', en: 'Healthy' },
  [ToothCondition.Decayed]: { es: 'Cariado', en: 'Decayed' },
  [ToothCondition.Filled]: { es: 'Obturado', en: 'Filled' },
  [ToothCondition.Missing]: { es: 'Ausente', en: 'Missing' },
  [ToothCondition.Extracted]: { es: 'Extraído', en: 'Extracted' },
  [ToothCondition.Crown]: { es: 'Corona', en: 'Crown' },
  [ToothCondition.Bridge]: { es: 'Puente', en: 'Bridge' },
  [ToothCondition.Implant]: { es: 'Implante', en: 'Implant' },
  [ToothCondition.RootCanal]: { es: 'Endodoncia', en: 'Root Canal' },
  [ToothCondition.Fracture]: { es: 'Fractura', en: 'Fracture' },
  [ToothCondition.Sealant]: { es: 'Sellante', en: 'Sealant' },
  [ToothCondition.Prosthesis]: { es: 'Prótesis', en: 'Prosthesis' },
};

// Check if a tooth is in the upper jaw
export const isUpperTooth = (toothNumber: number): boolean => {
  const firstDigit = Math.floor(toothNumber / 10);
  return firstDigit <= 2 || (firstDigit >= 5 && firstDigit <= 6);
};

// Check if a tooth is on the right side (patient's right)
export const isRightSide = (toothNumber: number): boolean => {
  const firstDigit = Math.floor(toothNumber / 10);
  return firstDigit === 1 || firstDigit === 4 || firstDigit === 5 || firstDigit === 8;
};
