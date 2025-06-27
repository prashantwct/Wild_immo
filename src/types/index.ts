export interface Animal {
  id: string;
  species: string;
  name?: string;
  identifier?: string; // e.g., tag number, microchip
  sex?: 'male' | 'female' | 'unknown';
  ageClass?: 'cub' | 'subadult' | 'adult' | 'senior';
  estimatedWeight?: number; // in kg
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrugDosage {
  name: string;
  concentration: number; // mg/ml
  doseRange: [number, number]; // [min, max] in mg/kg
  route: string; // e.g., 'IM', 'IV', 'SC', 'IM/IV'
  notes?: string;
}

export interface SpeciesProtocol {
  speciesName: string;
  primaryDrugs: DrugDosage[];
  secondaryDrugs?: DrugDosage[];
  reversalDrugs: DrugDosage[];
  notes?: string;
}

export interface ImmobilizationEvent {
  id: string;
  animalId: string;
  startTime: Date;
  endTime?: Date;
  drugsAdministered?: Array<{
    drugName: string;
    concentration: number;
    volume: number; // ml
    dose: number; // total dose in mg
    unit: string; // e.g., 'mg', 'ml', 'IU'
    route: string;
    time: Date;
    notes?: string;
    sample?: {
      type: string;
      time: string;
      notes?: string;
    };
  }>;
  phases: Array<{
    phase: 'induction' | 'immobilization' | 'recovery' | 'recovery_complete' | 'complication' | 'other';
    startTime: Date;
    endTime?: Date;
    notes?: string;
  }>;
  vitals: Array<{
    time: Date;
    heartRate?: number;
    respirationRate?: number;
    temperature?: number;
    capillaryRefillTime?: number;
    oxygenSaturation?: number;
    notes?: string;
  }>;
  complications?: string[];
  notes?: string;
}

export interface Measurement {
  id: string;
  animalId: string;
  eventId: string;
  timestamp: Date;
  measurements: {
    totalLength?: number; // cm
    tailLength?: number; // cm
    shoulderHeight?: number; // cm
    chestGirth?: number; // cm
    neckCircumference?: number; // cm
    weight?: number; // kg
    upperCanineWidth?: number; // in mm
    lowerCanineWidth?: number; // in mm
    upperCanineLength?: number; // in mm
    lowerCanineLength?: number; // in mm
    intercanineDistanceUpper?: number;
    intercanineDistanceLower?: number;
    [key: string]: number | undefined; // for additional custom measurements
  };
  notes?: string;
}
