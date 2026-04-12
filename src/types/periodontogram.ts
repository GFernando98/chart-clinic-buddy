// ============= Periodontogram Types =============

export interface Periodontogram {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  examinationDate: string;
  notes?: string;
  bleedingIndex: number; // % calculated
  plaqueIndex: number;   // % calculated
  status: PeriodontogramStatus;
  measurements: PeriodontalMeasurement[];
}

export enum PeriodontogramStatus {
  Draft = 1,
  Finalized = 2,
}

export interface PeriodontalMeasurement {
  id: string;
  periodontogramId: string;
  toothNumber: number;
  surface: PerioSurface;
  point: PerioPoint;
  probingDepth: number;     // mm (1-15)
  gingivalRecession: number; // mm (0-15)
  clinicalAttachmentLevel: number; // calculated: probingDepth + recession
  bleedingOnProbing: boolean;
  plaquePresent: boolean;
  furcation: FurcationGrade | null; // only molars/premolars
  mobility: MobilityGrade;  // per tooth, same for all 6 points
}

export enum PerioSurface {
  Vestibular = 'vestibular',
  PalatinoLingual = 'palatino_lingual',
}

export enum PerioPoint {
  Mesial = 'mesial',
  Central = 'central',
  Distal = 'distal',
}

export enum FurcationGrade {
  None = 0,
  Initial = 1,
  Partial = 2,
  Total = 3,
}

export enum MobilityGrade {
  None = 0,
  GradeI = 1,
  GradeII = 2,
  GradeIII = 3,
}

// Form data for a single tooth (6 measurement points)
export interface ToothPerioData {
  toothNumber: number;
  mobility: MobilityGrade;
  furcation: FurcationGrade | null;
  vestibular: {
    mesial: PointData;
    central: PointData;
    distal: PointData;
  };
  palatino_lingual: {
    mesial: PointData;
    central: PointData;
    distal: PointData;
  };
}

export interface PointData {
  probingDepth: number;
  gingivalRecession: number;
  bleedingOnProbing: boolean;
  plaquePresent: boolean;
}

// API request/response types
export interface CreatePeriodontogramData {
  patientId: string;
  doctorId: string;
  examinationDate: string;
  notes?: string;
}

export interface SaveToothMeasurementsData {
  periodontogramId: string;
  toothNumber: number;
  mobility: MobilityGrade;
  furcation: FurcationGrade | null;
  measurements: {
    surface: PerioSurface;
    point: PerioPoint;
    probingDepth: number;
    gingivalRecession: number;
    bleedingOnProbing: boolean;
    plaquePresent: boolean;
  }[];
}

export interface FinalizePeriodontogramData {
  bleedingIndex: number;
  plaqueIndex: number;
}

// ============= REST API Endpoints =============
/**
 * GET    /api/Periodontogram/GetByPatient/{patientId}
 *   → ApiResponse<Periodontogram[]>
 *
 * GET    /api/Periodontogram/GetById/{id}
 *   → ApiResponse<Periodontogram>
 *
 * POST   /api/Periodontogram/Create
 *   Body: CreatePeriodontogramData
 *   → ApiResponse<Periodontogram>
 *
 * POST   /api/Periodontogram/SaveToothMeasurements
 *   Body: SaveToothMeasurementsData
 *   → ApiResponse<PeriodontalMeasurement[]>
 *
 * PATCH  /api/Periodontogram/Finalize/{id}
 *   Body: FinalizePeriodontogramData
 *   → ApiResponse<Periodontogram>
 *
 * DELETE /api/Periodontogram/Delete/{id}
 *   → ApiResponse<null>
 */
