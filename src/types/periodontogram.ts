// ============= Periodontogram Types =============

export interface Periodontogram {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  examinationDate: string;
  notes?: string;
  bleedingIndex: number | null;
  plaqueIndex: number | null;
  status: PeriodontogramStatus;
  measurements: PeriodontalMeasurement[];
}

export type PeriodontogramStatus = 'Draft' | 'Finalized';

export interface PeriodontalMeasurement {
  id: string;
  toothNumber: number;
  surface: PerioSurface;
  point: PerioPoint;
  probingDepth: number;
  recession: number;
  clinicalAttachmentLevel: number;
  bleeding: boolean;
  plaque: boolean;
  furcation: FurcationGrade | null;
  mobility: MobilityGrade | null;
}

export type PerioSurface = 'Vestibular' | 'LingualPalatine';

export type PerioPoint = 'Mesial' | 'Central' | 'Distal';

export type FurcationGrade = 'None' | 'GradeI' | 'GradeII' | 'GradeIII';

export type MobilityGrade = 'None' | 'GradeI' | 'GradeII' | 'GradeIII';

// Form data for a single tooth (6 measurement points)
export interface ToothPerioData {
  toothNumber: number;
  mobility: MobilityGrade;
  furcation: FurcationGrade;
  vestibular: {
    mesial: PointData;
    central: PointData;
    distal: PointData;
  };
  lingualPalatine: {
    mesial: PointData;
    central: PointData;
    distal: PointData;
  };
}

export interface PointData {
  probingDepth: number;
  recession: number;
  bleeding: boolean;
  plaque: boolean;
}

// API request types
export interface CreatePeriodontogramData {
  patientId: string;
  doctorId: string;
  examinationDate?: string;
  notes?: string;
}

export interface SaveToothMeasurementsPayload {
  periodontalRecordId: string;
  toothNumber: number;
  vestibular: MeasurementPointPayload[];
  lingualPalatine: MeasurementPointPayload[];
  furcation: FurcationGrade;
  mobility: MobilityGrade;
}

export interface MeasurementPointPayload {
  point: PerioPoint;
  probingDepth: number;
  recession: number;
  bleeding: boolean;
  plaque: boolean;
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
 *   Body: SaveToothMeasurementsPayload
 *   → ApiResponse<PeriodontalMeasurement[]>
 *
 * PATCH  /api/Periodontogram/Finalize/{id}
 *   Body: FinalizePeriodontogramData
 *   → ApiResponse<Periodontogram>
 *
 * DELETE /api/Periodontogram/Delete/{id}
 *   → ApiResponse<boolean>
 */
