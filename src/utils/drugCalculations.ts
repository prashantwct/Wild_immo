import { DrugDosage, SpeciesProtocol } from '@/types';

// Define available drugs
export const AVAILABLE_DRUGS = {
  // Primary immobilization drugs
  ketamine: 'Ketamine',
  tiletamineZolazepam: 'Tiletamine-Zolazepam (Telazol)',
  medetomidine: 'Medetomidine', 
  xylazine: 'Xylazine',
  dexmedetomidine: 'Dexmedetomidine',
  midazolam: 'Midazolam',
  butorphanol: 'Butorphanol',
  etorphine: 'Etorphine (M99)',
  acepromazine: 'Acepromazine',
  diazepam: 'Diazepam',
  azaperone: 'Azaperone',
  
  // Reversal drugs
  atipamezole: 'Atipamezole (Antisedan)',
  naltrexone: 'Naltrexone',
  yohimbine: 'Yohimbine',
  flumazenil: 'Flumazenil',
  tolazoline: 'Tolazoline',
  naloxone: 'Naloxone',
  
  // Emergency drugs
  epinephrine: 'Epinephrine',
  doxapram: 'Doxapram',
  atropine: 'Atropine',
  glycopyrrolate: 'Glycopyrrolate',
  dexamethasone: 'Dexamethasone',
  furosemide: 'Furosemide',
  prednisolone: 'Prednisolone',
  diphenhydramine: 'Diphenhydramine'
};

// Drug categories for organization
export const DRUG_CATEGORIES = {
  PRIMARY: 'Primary Immobilization Drugs',
  REVERSAL: 'Reversal Drugs',
  EMERGENCY: 'Emergency Drugs'
};

// Map drugs to their categories
export const DRUG_CATEGORY_MAP: Record<string, string> = {
  // Primary drugs
  'Ketamine': DRUG_CATEGORIES.PRIMARY,
  'Tiletamine-Zolazepam (Telazol)': DRUG_CATEGORIES.PRIMARY,
  'Medetomidine': DRUG_CATEGORIES.PRIMARY, 
  'Xylazine': DRUG_CATEGORIES.PRIMARY,
  'Dexmedetomidine': DRUG_CATEGORIES.PRIMARY,
  'Midazolam': DRUG_CATEGORIES.PRIMARY,
  'Butorphanol': DRUG_CATEGORIES.PRIMARY,
  'Etorphine (M99)': DRUG_CATEGORIES.PRIMARY,
  'Acepromazine': DRUG_CATEGORIES.PRIMARY,
  'Diazepam': DRUG_CATEGORIES.PRIMARY,
  'Azaperone': DRUG_CATEGORIES.PRIMARY,
  
  // Reversal drugs
  'Atipamezole (Antisedan)': DRUG_CATEGORIES.REVERSAL,
  'Naltrexone': DRUG_CATEGORIES.REVERSAL,
  'Yohimbine': DRUG_CATEGORIES.REVERSAL,
  'Flumazenil': DRUG_CATEGORIES.REVERSAL,
  'Tolazoline': DRUG_CATEGORIES.REVERSAL,
  'Naloxone': DRUG_CATEGORIES.REVERSAL,
  
  // Emergency drugs
  'Epinephrine': DRUG_CATEGORIES.EMERGENCY,
  'Doxapram': DRUG_CATEGORIES.EMERGENCY,
  'Atropine': DRUG_CATEGORIES.EMERGENCY,
  'Glycopyrrolate': DRUG_CATEGORIES.EMERGENCY,
  'Dexamethasone': DRUG_CATEGORIES.EMERGENCY,
  'Furosemide': DRUG_CATEGORIES.EMERGENCY,
  'Prednisolone': DRUG_CATEGORIES.EMERGENCY,
  'Diphenhydramine': DRUG_CATEGORIES.EMERGENCY
};

// Common emergency drug protocols
export const EMERGENCY_DRUG_PROTOCOLS: { [key: string]: DrugDosage } = {
  epinephrine: {
    name: 'Epinephrine',
    concentration: 1,  // 1:1000 = 1mg/ml
    doseRange: [0.01, 0.02],  // mg/kg
    route: 'IV/IM/IT',
    notes: 'Cardiac arrest, anaphylaxis. IV preferred. Intratracheal (IT) dose is 2-2.5x IV dose.'
  },
  atropine: {
    name: 'Atropine',
    concentration: 0.5,  // 0.5mg/ml
    doseRange: [0.02, 0.04],  // mg/kg
    route: 'IV/IM/SC',
    notes: 'Bradycardia, excessive salivation. Can be repeated every 3-5 minutes up to 3 doses.'
  },
  doxapram: {
    name: 'Doxapram',
    concentration: 20,  // 20mg/ml
    doseRange: [5, 10],  // mg/kg
    route: 'IV',
    notes: 'Respiratory stimulant. Use for respiratory depression. Short duration.'
  },
  glycopyrrolate: {
    name: 'Glycopyrrolate',
    concentration: 0.2,  // 0.2mg/ml
    doseRange: [0.01, 0.02],  // mg/kg
    route: 'IV/IM',
    notes: 'Alternative to atropine for bradycardia and secretions. Slower onset but longer duration.'
  },
  dexamethasone: {
    name: 'Dexamethasone',
    concentration: 4,  // 4mg/ml
    doseRange: [0.1, 0.2],  // mg/kg
    route: 'IV/IM',
    notes: 'Anti-inflammatory, cerebral edema, shock.'
  },
  furosemide: {
    name: 'Furosemide',
    concentration: 50,  // 50mg/ml
    doseRange: [1, 4],  // mg/kg
    route: 'IV/IM',
    notes: 'Pulmonary edema, cerebral edema.'
  },
  diphenhydramine: {
    name: 'Diphenhydramine',
    concentration: 50,  // 50mg/ml
    doseRange: [1, 2],  // mg/kg
    route: 'IV/IM',
    notes: 'Allergic reactions.'
  }
};

// Predefined protocols by species
export const SPECIES_PROTOCOLS: { [key: string]: SpeciesProtocol } = {
  // Big cats
  'Panthera leo': {
    speciesName: 'Lion',
    primaryDrugs: [
      {
        name: 'Tiletamine-Zolazepam (Telazol)',
        doseRange: [3, 5],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Medetomidine',
        doseRange: [0.03, 0.05],  // mg/kg
        concentration: 1,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Atipamezole',
        doseRange: [5 * 0.04, 5 * 0.04],  // 5x medetomidine dose
        concentration: 5,   // mg/ml
        route: 'IM/IV'
      }
    ],
    notes: 'Monitor respiration closely. Administer half the calculated reversal dose IM and half IV.'
  },
  'Panthera tigris': {
    speciesName: 'Tiger',
    primaryDrugs: [
      {
        name: 'Ketamine',
        doseRange: [2.5, 3],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Medetomidine',
        doseRange: [0.06, 0.08],  // mg/kg
        concentration: 1,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Atipamezole',
        doseRange: [5 * 0.07, 5 * 0.07],  // 5x medetomidine dose
        concentration: 5,   // mg/ml
        route: 'IM/IV'
      }
    ],
    notes: 'For Bengal tiger subspecies: Reduce ketamine dose by 10-15% for compromised/older animals.'
  },
  'Panthera pardus': {
    speciesName: 'Leopard',
    primaryDrugs: [
      {
        name: 'Ketamine',
        doseRange: [5, 8],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Xylazine',
        doseRange: [1, 2],  // mg/kg
        concentration: 20,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Yohimbine',
        doseRange: [0.1, 0.2],  // mg/kg
        concentration: 2,   // mg/ml
        route: 'IV'
      }
    ],
    notes: 'Monitor closely for respiratory depression. Indian leopards may be more sensitive to ketamine.'
  },
  'Cuon alpinus': {
    speciesName: 'Dhole (Wild Dog)',
    primaryDrugs: [
      {
        name: 'Ketamine',
        doseRange: [3, 5],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Medetomidine',
        doseRange: [0.03, 0.05],  // mg/kg
        concentration: 1,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Atipamezole',
        doseRange: [5 * 0.04, 5 * 0.04],  // 5x medetomidine dose
        concentration: 5,   // mg/ml
        route: 'IM'
      }
    ],
    notes: 'Dholes are particularly sensitive to capture stress. Minimize handling time and noise.'
  },
  'Melursus ursinus': {
    speciesName: 'Sloth Bear',
    primaryDrugs: [
      {
        name: 'Tiletamine-Zolazepam (Telazol)',
        doseRange: [4, 6],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Medetomidine',
        doseRange: [0.04, 0.06],  // mg/kg
        concentration: 1,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Atipamezole',
        doseRange: [5 * 0.05, 5 * 0.05],  // 5x medetomidine dose
        concentration: 5,   // mg/ml
        route: 'IM'
      }
    ],
    notes: 'Often has parasites. Use long-range darting equipment and approach with caution.'
  },
  'Elephas maximus': {
    speciesName: 'Asian Elephant',
    primaryDrugs: [
      {
        name: 'Etorphine (M99)',
        doseRange: [0.002, 0.004],  // mg/kg
        concentration: 9.8,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Azaperone',
        doseRange: [0.03, 0.08],  // mg/kg
        concentration: 40,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Naltrexone',
        doseRange: [100 * 0.003, 100 * 0.003],  // 100x etorphine dose
        concentration: 50,   // mg/ml
        route: 'IV'
      }
    ],
    notes: 'EXTREMELY DANGEROUS. Use only under expert veterinary supervision. Monitor for respiratory depression.'
  },
  'Axis axis': {
    speciesName: 'Chital/Spotted Deer',
    primaryDrugs: [
      {
        name: 'Ketamine',
        doseRange: [3, 5],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Xylazine',
        doseRange: [0.5, 1],  // mg/kg
        concentration: 20,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Yohimbine',
        doseRange: [0.125, 0.25],  // mg/kg
        concentration: 2,   // mg/ml
        route: 'IV/IM'
      }
    ],
    notes: 'High risk of capture myopathy. Keep handling time minimal and monitor body temperature.'
  },
  'Antilope cervicapra': {
    speciesName: 'Blackbuck',
    primaryDrugs: [
      {
        name: 'Tiletamine-Zolazepam (Telazol)',
        doseRange: [3, 4],  // mg/kg
        concentration: 100,   // mg/ml
        route: 'IM'
      },
      {
        name: 'Xylazine',
        doseRange: [0.5, 0.75],  // mg/kg
        concentration: 20,   // mg/ml
        route: 'IM'
      }
    ],
    reversalDrugs: [
      {
        name: 'Yohimbine',
        doseRange: [0.125, 0.25],  // mg/kg
        concentration: 2,   // mg/ml
        route: 'IV/IM'
      }
    ],
    notes: 'Extremely stress-prone. Use capture nets when possible instead of chemical immobilization.'
  },
};

/**
 * Calculate drug dosage based on weight and protocol
 */
export function calculateDosage(
  weight: number,
  drug: DrugDosage,
  volumeOnly: boolean = false
): { doseMg: number; volumeMl: number } {
  if (weight <= 0) {
    throw new Error('Weight must be greater than 0');
  }

  const doseMg = ((drug.doseRange[0] + drug.doseRange[1]) / 2) * weight; // Using average of min and max
  const volumeMl = doseMg / drug.concentration;

  return {
    doseMg: volumeOnly ? 0 : doseMg,
    volumeMl,
  };
}

/**
 * Get protocol for a specific species
 */
export function getSpeciesProtocol(species: string): SpeciesProtocol | undefined {
  return SPECIES_PROTOCOLS[species];
}

/**
 * Calculate all drug doses for an immobilization event
 */
export function calculateAllDrugs(
  species: string,
  weight: number
): Array<{ drug: DrugDosage; doseMg: number; volumeMl: number }> {
  const protocol = getSpeciesProtocol(species);
  if (!protocol) {
    throw new Error(`No protocol found for species: ${species}`);
  }

  return [
    ...protocol.primaryDrugs.map((drug) => ({
      drug,
      ...calculateDosage(weight, drug),
    })),
    ...protocol.secondaryDrugs.map((drug) => ({
      drug,
      ...calculateDosage(weight, drug, true), // Volume only for secondary drugs
    })),
  ];
}
