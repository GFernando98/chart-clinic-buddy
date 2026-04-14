/**
 * Anatomical SVG path data for each tooth type.
 * All paths are designed for a 60x100 viewBox.
 * Crown occupies roughly y=35..85 (lower) or y=15..65 (upper).
 * Roots extend beyond the crown.
 *
 * For upper teeth, the paths are flipped vertically via SVG transform.
 */

export interface ToothPathData {
  /** Full tooth outline (crown + roots) for background silhouette */
  outline: string;
  /** Crown-only outline for clipping surfaces */
  crown: string;
  /** Crown bounding box [x, y, width, height] for surface layout */
  crownBox: [number, number, number, number];
}

// ─── MOLAR (wide, 2-3 cusps on crown, 2-3 roots) ───────────────────────

const molarLower: ToothPathData = {
  outline: `
    M 8 40 
    C 6 38, 4 35, 5 30 
    C 6 26, 10 24, 14 22
    C 16 18, 15 10, 14 4
    C 14 2, 16 1, 17 3
    C 18 10, 19 18, 20 22
    C 22 20, 26 18, 28 18
    C 30 18, 34 20, 36 22
    C 37 16, 38 8, 39 3
    C 39 1, 41 1, 41 3
    C 41 8, 42 14, 44 20
    C 46 18, 47 17, 48 16
    C 50 14, 52 14, 52 16
    C 52 18, 50 22, 48 24
    C 50 26, 52 30, 52 34
    C 52 38, 50 40, 48 42
    C 46 44, 42 45, 38 45
    C 34 45, 30 46, 28 46
    C 24 46, 18 45, 14 44
    C 10 43, 8 42, 8 40 Z
  `,
  crown: `
    M 8 40 
    C 6 38, 4 35, 5 30 
    C 6 26, 10 24, 14 22
    C 18 20, 24 18, 28 18
    C 34 18, 42 20, 48 24
    C 50 26, 52 30, 52 34
    C 52 38, 50 40, 48 42
    C 46 44, 42 45, 38 45
    C 30 46, 18 45, 14 44
    C 10 43, 8 42, 8 40 Z
  `,
  crownBox: [5, 18, 47, 28],
};

const molarUpper: ToothPathData = {
  outline: `
    M 8 60
    C 6 62, 4 65, 5 70
    C 6 74, 10 76, 14 78
    C 16 82, 15 90, 14 96
    C 14 98, 16 99, 17 97
    C 18 90, 19 82, 20 78
    C 22 80, 26 82, 28 82
    C 30 82, 34 80, 36 78
    C 37 84, 38 92, 39 97
    C 39 99, 41 99, 41 97
    C 41 92, 42 86, 44 80
    C 46 82, 47 83, 48 84
    C 50 86, 52 86, 52 84
    C 52 82, 50 78, 48 76
    C 50 74, 52 70, 52 66
    C 52 62, 50 60, 48 58
    C 46 56, 42 55, 38 55
    C 34 55, 30 54, 28 54
    C 24 54, 18 55, 14 56
    C 10 57, 8 58, 8 60 Z
  `,
  crown: `
    M 8 60
    C 6 62, 4 65, 5 70
    C 6 74, 10 76, 14 78
    C 18 80, 24 82, 28 82
    C 34 82, 42 80, 48 76
    C 50 74, 52 70, 52 66
    C 52 62, 50 60, 48 58
    C 46 56, 42 55, 38 55
    C 30 54, 18 55, 14 56
    C 10 57, 8 58, 8 60 Z
  `,
  crownBox: [5, 54, 47, 28],
};

// ─── PREMOLAR (medium width, 2 cusps, 1-2 roots) ────────────────────────

const premolarLower: ToothPathData = {
  outline: `
    M 12 40
    C 10 38, 9 34, 10 30
    C 11 26, 14 23, 18 20
    C 20 16, 19 8, 18 3
    C 18 1, 20 0, 21 2
    C 22 8, 23 16, 24 20
    C 26 18, 30 18, 32 20
    C 33 14, 34 6, 35 2
    C 35 0, 37 0, 37 2
    C 37 6, 38 14, 38 20
    C 42 23, 45 26, 46 30
    C 47 34, 46 38, 44 40
    C 42 42, 38 44, 34 44
    C 30 44, 24 44, 22 44
    C 18 44, 14 42, 12 40 Z
  `,
  crown: `
    M 12 40
    C 10 38, 9 34, 10 30
    C 11 26, 14 23, 18 20
    C 22 18, 26 18, 30 18
    C 34 18, 38 20, 38 20
    C 42 23, 45 26, 46 30
    C 47 34, 46 38, 44 40
    C 42 42, 38 44, 34 44
    C 24 44, 18 44, 14 42
    C 12 42, 12 40, 12 40 Z
  `,
  crownBox: [9, 18, 38, 26],
};

const premolarUpper: ToothPathData = {
  outline: `
    M 12 60
    C 10 62, 9 66, 10 70
    C 11 74, 14 77, 18 80
    C 20 84, 19 92, 18 97
    C 18 99, 20 100, 21 98
    C 22 92, 23 84, 24 80
    C 26 82, 30 82, 32 80
    C 33 86, 34 94, 35 98
    C 35 100, 37 100, 37 98
    C 37 94, 38 86, 38 80
    C 42 77, 45 74, 46 70
    C 47 66, 46 62, 44 60
    C 42 58, 38 56, 34 56
    C 30 56, 24 56, 22 56
    C 18 56, 14 58, 12 60 Z
  `,
  crown: `
    M 12 60
    C 10 62, 9 66, 10 70
    C 11 74, 14 77, 18 80
    C 22 82, 26 82, 30 82
    C 34 82, 38 80, 38 80
    C 42 77, 45 74, 46 70
    C 47 66, 46 62, 44 60
    C 42 58, 38 56, 34 56
    C 24 56, 18 56, 14 58
    C 12 58, 12 60, 12 60 Z
  `,
  crownBox: [9, 56, 38, 26],
};

// ─── CANINE (narrow, pointed cusp, single long root) ─────────────────────

const canineLower: ToothPathData = {
  outline: `
    M 18 42
    C 16 40, 14 36, 15 30
    C 16 26, 20 22, 24 16
    C 26 10, 27 5, 28 1
    C 28 0, 30 0, 30 1
    C 30 5, 31 10, 32 16
    C 36 22, 40 26, 41 30
    C 42 36, 40 40, 38 42
    C 36 44, 32 46, 28 46
    C 24 46, 20 44, 18 42 Z
  `,
  crown: `
    M 18 42
    C 16 40, 14 36, 15 30
    C 16 26, 20 22, 24 16
    C 26 14, 28 12, 30 12
    C 32 12, 34 16, 32 16
    C 36 22, 40 26, 41 30
    C 42 36, 40 40, 38 42
    C 36 44, 32 46, 28 46
    C 24 46, 20 44, 18 42 Z
  `,
  crownBox: [14, 12, 28, 34],
};

const canineUpper: ToothPathData = {
  outline: `
    M 18 58
    C 16 60, 14 64, 15 70
    C 16 74, 20 78, 24 84
    C 26 90, 27 95, 28 99
    C 28 100, 30 100, 30 99
    C 30 95, 31 90, 32 84
    C 36 78, 40 74, 41 70
    C 42 64, 40 60, 38 58
    C 36 56, 32 54, 28 54
    C 24 54, 20 56, 18 58 Z
  `,
  crown: `
    M 18 58
    C 16 60, 14 64, 15 70
    C 16 74, 20 78, 24 84
    C 26 86, 28 88, 30 88
    C 32 88, 34 84, 32 84
    C 36 78, 40 74, 41 70
    C 42 64, 40 60, 38 58
    C 36 56, 32 54, 28 54
    C 24 54, 20 56, 18 58 Z
  `,
  crownBox: [14, 54, 28, 34],
};

// ─── INCISOR (narrow, flat/rounded edge, single root) ────────────────────

const incisorLower: ToothPathData = {
  outline: `
    M 20 42
    C 18 40, 16 36, 17 30
    C 18 26, 22 22, 24 16
    C 25 10, 26 5, 27 1
    C 27 0, 29 0, 29 1
    C 30 5, 31 10, 32 16
    C 34 22, 38 26, 39 30
    C 40 36, 38 40, 36 42
    C 34 44, 32 46, 28 46
    C 24 46, 22 44, 20 42 Z
  `,
  crown: `
    M 20 42
    C 18 40, 16 36, 17 30
    C 18 26, 22 22, 24 18
    C 26 16, 28 16, 30 16
    C 32 16, 34 18, 32 18
    C 34 22, 38 26, 39 30
    C 40 36, 38 40, 36 42
    C 34 44, 32 46, 28 46
    C 24 46, 22 44, 20 42 Z
  `,
  crownBox: [16, 16, 24, 30],
};

const incisorUpper: ToothPathData = {
  outline: `
    M 20 58
    C 18 60, 16 64, 17 70
    C 18 74, 22 78, 24 84
    C 25 90, 26 95, 27 99
    C 27 100, 29 100, 29 99
    C 30 95, 31 90, 32 84
    C 34 78, 38 74, 39 70
    C 40 64, 38 60, 36 58
    C 34 56, 32 54, 28 54
    C 24 54, 22 56, 20 58 Z
  `,
  crown: `
    M 20 58
    C 18 60, 16 64, 17 70
    C 18 74, 22 78, 24 82
    C 26 84, 28 84, 30 84
    C 32 84, 34 82, 32 82
    C 34 78, 38 74, 39 70
    C 40 64, 38 60, 36 58
    C 34 56, 32 54, 28 54
    C 24 54, 22 56, 20 58 Z
  `,
  crownBox: [16, 54, 24, 30],
};

/**
 * Get the appropriate tooth path data based on type and jaw position.
 */
export function getToothPaths(
  toothType: 'molar' | 'premolar' | 'canine' | 'incisor',
  isUpper: boolean
): ToothPathData {
  switch (toothType) {
    case 'molar':
      return isUpper ? molarUpper : molarLower;
    case 'premolar':
      return isUpper ? premolarUpper : premolarLower;
    case 'canine':
      return isUpper ? canineUpper : canineLower;
    case 'incisor':
      return isUpper ? incisorUpper : incisorLower;
  }
}
