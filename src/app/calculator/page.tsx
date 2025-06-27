'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveFormState, loadFormState } from '@/utils/formPersistence';
import { PlusIcon, CalculatorIcon, PlusCircleIcon, TrashIcon, ShieldExclamationIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Animal, DrugDosage, SpeciesProtocol } from '@/types';
import { calculateAllDrugs, getSpeciesProtocol, SPECIES_PROTOCOLS, AVAILABLE_DRUGS, DRUG_CATEGORIES, DRUG_CATEGORY_MAP, EMERGENCY_DRUG_PROTOCOLS } from '@/utils/drugCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CalculatorPage() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [species, setSpecies] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [protocol, setProtocol] = useState<SpeciesProtocol | null>(null);
  const [results, setResults] = useState<Array<{
    drug: string;
    concentration: number;
    doseMg: number;
    volumeMl: number;
    route: string;
    category?: string;
  }>>([]);
  
  // Drug state management
  const [customDrugs, setCustomDrugs] = useState<Array<{
    drugName: string;
    concentration: string;
    minDose: string;
    maxDose: string;
    route: string;
    category?: string;
  }>>([]);
  
  const [useCustomDrugs, setUseCustomDrugs] = useState(false);
  
  // Reversal and emergency drug management
  const [showReversalDrugs, setShowReversalDrugs] = useState(false);
  const [showEmergencyDrugs, setShowEmergencyDrugs] = useState(false);
  
  const [reversalDrugs, setReversalDrugs] = useState<Array<{
    drugName: string;
    concentration: string;
    minDose: string;
    maxDose: string;
    route: string;
  }>>([]);
  
  const [emergencyDrugs, setEmergencyDrugs] = useState<Array<{
    drugName: string;
    concentration: string;
    minDose: string;
    maxDose: string;
    route: string;
  }>>([]);

  // Load animals from localStorage
  useEffect(() => {
    const savedAnimals = localStorage.getItem('animals');
    if (savedAnimals) {
      setAnimals(JSON.parse(savedAnimals));
    }
    
    // Load saved calculator form state
    const savedCalcState = loadFormState('calculator', {
      animalId: '',
      species: '',
      weight: '',
      customDrugs: [],
      reversalDrugs: [],
      emergencyDrugs: [],
      useCustom: false,
      showReversal: false,
      showEmergency: false
    });
    
    if (savedCalcState) {
      setSelectedAnimalId(savedCalcState.animalId || '');
      setSpecies(savedCalcState.species || '');
      setWeight(savedCalcState.weight || '');
      setUseCustomDrugs(savedCalcState.useCustom || false);
      setShowReversalDrugs(savedCalcState.showReversal || false);
      setShowEmergencyDrugs(savedCalcState.showEmergency || false);
      
      if (savedCalcState.customDrugs && savedCalcState.customDrugs.length > 0) {
        setCustomDrugs(savedCalcState.customDrugs);
      }
      
      if (savedCalcState.reversalDrugs && savedCalcState.reversalDrugs.length > 0) {
        setReversalDrugs(savedCalcState.reversalDrugs);
      }
      
      if (savedCalcState.emergencyDrugs && savedCalcState.emergencyDrugs.length > 0) {
        setEmergencyDrugs(savedCalcState.emergencyDrugs);
      }
    }
  }, []);

  // Update protocol when species changes
  useEffect(() => {
    if (species) {
      const selectedProtocol = getSpeciesProtocol(species);
      setProtocol(selectedProtocol || null);
    } else {
      setProtocol(null);
    }
    setResults([]);
  }, [species]);

  // Update form when animal is selected
  useEffect(() => {
    if (selectedAnimalId && animals.length > 0) {
      const animal = animals.find(a => a.id === selectedAnimalId);
      if (animal) {
        setSpecies(animal.species);
        setWeight(animal.estimatedWeight?.toString() || '');
      }
    }
  }, [selectedAnimalId, animals]);

  const addCustomDrug = () => {
    // Use the first drug from AVAILABLE_DRUGS as default
    const defaultDrugName = Object.values(AVAILABLE_DRUGS)[0] || '';
    
    setCustomDrugs([...customDrugs, {
      drugName: defaultDrugName,
      concentration: '100',
      minDose: '0.1',
      maxDose: '1',
      route: 'IM',
      category: DRUG_CATEGORIES.PRIMARY
    }]);
    setUseCustomDrugs(true);
  };

  const removeCustomDrug = (index: number) => {
    setCustomDrugs(customDrugs.filter((_, i) => i !== index));
  };

  const updateCustomDrug = (index: number, field: string, value: string) => {
    const updatedDrugs = [...customDrugs];
    updatedDrugs[index] = { ...updatedDrugs[index], [field]: value };
    setCustomDrugs(updatedDrugs);
  };
  
  // Reversal drug management functions
  const addReversalDrug = () => {
    // Default to first reversal drug
    const reversalDrugNames = Object.entries(AVAILABLE_DRUGS)
      .filter(([_, name]) => DRUG_CATEGORY_MAP[name] === DRUG_CATEGORIES.REVERSAL)
      .map(([_, name]) => name);
      
    const defaultDrugName = reversalDrugNames[0] || 'Atipamezole (Antisedan)';
    
    setReversalDrugs([...reversalDrugs, {
      drugName: defaultDrugName,
      concentration: '5',
      minDose: '0.05',
      maxDose: '0.1',
      route: 'IM/IV'
    }]);
    setShowReversalDrugs(true);
    
    // Save form state when adding reversal drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs: [...reversalDrugs, {
        drugName: defaultDrugName,
        concentration: '5',
        minDose: '0.05',
        maxDose: '0.1',
        route: 'IM/IV'
      }],
      emergencyDrugs,
      useCustom: useCustomDrugs,
      showReversal: true,
      showEmergency: showEmergencyDrugs
    });
  };

  const removeReversalDrug = (index: number) => {
    const updated = reversalDrugs.filter((_, i) => i !== index);
    setReversalDrugs(updated);
    
    if (updated.length === 0) {
      setShowReversalDrugs(false);
    }
    
    // Save form state when removing reversal drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs: updated,
      emergencyDrugs,
      useCustom: useCustomDrugs,
      showReversal: updated.length > 0,
      showEmergency: showEmergencyDrugs
    });
  };

  const updateReversalDrug = (index: number, field: string, value: string) => {
    const updatedDrugs = [...reversalDrugs];
    updatedDrugs[index] = { ...updatedDrugs[index], [field]: value };
    setReversalDrugs(updatedDrugs);
    
    // Save form state when updating reversal drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs: updatedDrugs,
      emergencyDrugs,
      useCustom: useCustomDrugs,
      showReversal: showReversalDrugs,
      showEmergency: showEmergencyDrugs
    });
  };
  
  // Emergency drug management functions
  const addEmergencyDrug = () => {
    // Default to first emergency drug
    const emergencyDrugNames = Object.entries(AVAILABLE_DRUGS)
      .filter(([_, name]) => DRUG_CATEGORY_MAP[name] === DRUG_CATEGORIES.EMERGENCY)
      .map(([_, name]) => name);
      
    const defaultDrugName = emergencyDrugNames[0] || 'Epinephrine';
    const defaultProtocol = EMERGENCY_DRUG_PROTOCOLS[Object.keys(EMERGENCY_DRUG_PROTOCOLS)[0]] || {
      concentration: 1,
      doseRange: [0.01, 0.02],
      route: 'IV'
    };
    
    setEmergencyDrugs([...emergencyDrugs, {
      drugName: defaultDrugName,
      concentration: defaultProtocol.concentration.toString(),
      minDose: defaultProtocol.doseRange[0].toString(),
      maxDose: defaultProtocol.doseRange[1].toString(),
      route: defaultProtocol.route
    }]);
    setShowEmergencyDrugs(true);
    
    // Save form state when adding emergency drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs,
      emergencyDrugs: [...emergencyDrugs, {
        drugName: defaultDrugName,
        concentration: defaultProtocol.concentration.toString(),
        minDose: defaultProtocol.doseRange[0].toString(),
        maxDose: defaultProtocol.doseRange[1].toString(),
        route: defaultProtocol.route
      }],
      useCustom: useCustomDrugs,
      showReversal: showReversalDrugs,
      showEmergency: true
    });
  };

  const removeEmergencyDrug = (index: number) => {
    const updated = emergencyDrugs.filter((_, i) => i !== index);
    setEmergencyDrugs(updated);
    
    if (updated.length === 0) {
      setShowEmergencyDrugs(false);
    }
    
    // Save form state when removing emergency drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs,
      emergencyDrugs: updated,
      useCustom: useCustomDrugs,
      showReversal: showReversalDrugs,
      showEmergency: updated.length > 0
    });
  };

  const updateEmergencyDrug = (index: number, field: string, value: string) => {
    const updatedDrugs = [...emergencyDrugs];
    updatedDrugs[index] = { ...updatedDrugs[index], [field]: value };
    setEmergencyDrugs(updatedDrugs);
    
    // Save form state when updating emergency drug
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs,
      emergencyDrugs: updatedDrugs,
      useCustom: useCustomDrugs,
      showReversal: showReversalDrugs,
      showEmergency: showEmergencyDrugs
    });
  };

  const calculateDosages = () => {
    if (!weight || (useCustomDrugs && customDrugs.length === 0 && reversalDrugs.length === 0 && emergencyDrugs.length === 0)) {
      alert('Please enter weight and at least one drug');
      return;
    }

    try {
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue) || weightValue <= 0) {
        alert('Please enter a valid weight');
        return;
      }

      let formattedResults = [];
      
      // Function to calculate drug dosages
      const calculateDrug = (drug: any) => {
        const concentration = parseFloat(drug.concentration);
        const minDose = parseFloat(drug.minDose);
        const maxDose = parseFloat(drug.maxDose);
        const avgDose = (minDose + maxDose) / 2;
        const doseMg = avgDose * weightValue;
        const volumeMl = doseMg / concentration;
        
        return {
          drug: drug.drugName,
          concentration: concentration,
          doseMg: parseFloat(doseMg.toFixed(2)),
          volumeMl: parseFloat(volumeMl.toFixed(2)),
          route: drug.route,
          category: drug.category || 'Unknown'
        };
      };
      
      if (useCustomDrugs) {
        // Calculate custom drugs
        const customResults = customDrugs.map(calculateDrug);
        formattedResults.push(...customResults);
      } else if (protocol) {
        // Calculate using protocol
        const protocolResults = calculateAllDrugs(protocol.speciesName, weightValue);
        formattedResults.push(...protocolResults);
      }
      
      // Add reversal drugs if any
      if (showReversalDrugs && reversalDrugs.length > 0) {
        const reversalResults = reversalDrugs.map(drug => {
          const result = calculateDrug(drug);
          result.category = DRUG_CATEGORIES.REVERSAL;
          return result;
        });
        formattedResults.push(...reversalResults);
      }
      
      // Add emergency drugs if any
      if (showEmergencyDrugs && emergencyDrugs.length > 0) {
        const emergencyResults = emergencyDrugs.map(drug => {
          const result = calculateDrug(drug);
          result.category = DRUG_CATEGORIES.EMERGENCY;
          return result;
        });
        formattedResults.push(...emergencyResults);
      }

      setResults(formattedResults);
      
      // Store form state for next time
      saveFormState('calculator', {
        animalId: selectedAnimalId,
        species,
        weight,
        customDrugs,
        reversalDrugs,
        emergencyDrugs,
        useCustom: useCustomDrugs,
        showReversal: showReversalDrugs,
        showEmergency: showEmergencyDrugs
      });
    } catch (error) {
      console.error('Error calculating dosages:', error);
      alert('Error calculating dosages');
    }
  };

  // Function to save calculator state
  const saveCalculatorState = () => {
    saveFormState('calculator', {
      animalId: selectedAnimalId,
      species,
      weight,
      customDrugs,
      reversalDrugs,
      emergencyDrugs,
      useCustom: useCustomDrugs,
      showReversal: showReversalDrugs,
      showEmergency: showEmergencyDrugs
    });
  };

  // Add event listeners to save state when values change
  useEffect(() => {
    saveCalculatorState();
  }, [selectedAnimalId, species, weight, customDrugs, useCustomDrugs, reversalDrugs, emergencyDrugs, showReversalDrugs, showEmergencyDrugs]);

  const handleAnimalChange = (id: string) => {
    setSelectedAnimalId(id);
    if (id === 'new') {
      router.push('/animals');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Drug Calculator</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="animal">Select Animal (Optional)</Label>
            <Select
              value={selectedAnimalId}
              onValueChange={handleAnimalChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an animal or enter details below" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    <span>Add New Animal</span>
                  </div>
                </SelectItem>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name || animal.species} {animal.identifier ? `(${animal.identifier})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Species *</Label>
            <Select
              value={species}
              onValueChange={setSpecies}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SPECIES_PROTOCOLS).map((speciesKey) => (
                  <SelectItem key={speciesKey} value={speciesKey}>
                    {SPECIES_PROTOCOLS[speciesKey].speciesName} ({speciesKey})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              type="number"
              id="weight"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="useCustom" 
              checked={useCustomDrugs} 
              onChange={(e) => setUseCustomDrugs(e.target.checked)} 
              className="w-4 h-4"
            />
            <Label htmlFor="useCustom" className="cursor-pointer">Use custom drug combination</Label>
          </div>

          {useCustomDrugs && (
            <div className="space-y-4 border p-4 rounded">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Custom Drug Combination</h3>
                <Button onClick={addCustomDrug} size="sm" variant="outline">
                  <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Drug
                </Button>
              </div>
              
              {customDrugs.map((drug, index) => (
                <div key={index} className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between">
                    <h4>Drug {index + 1}</h4>
                    <button 
                      onClick={() => removeCustomDrug(index)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label>Drug</Label>
                      <Select 
                        value={drug.drugName} 
                        onValueChange={(value) => updateCustomDrug(index, 'drugName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select drug" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(AVAILABLE_DRUGS).map((drugName) => (
                            <SelectItem key={drugName} value={drugName}>{drugName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Concentration (mg/ml)</Label>
                        <Input 
                          type="number" 
                          value={drug.concentration} 
                          onChange={(e) => updateCustomDrug(index, 'concentration', e.target.value)}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <Label>Min Dose</Label>
                          <Input 
                            type="number" 
                            value={drug.minDose} 
                            onChange={(e) => updateCustomDrug(index, 'minDose', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Max Dose</Label>
                          <Input 
                            type="number" 
                            value={drug.maxDose} 
                            onChange={(e) => updateCustomDrug(index, 'maxDose', e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Select 
                        value={drug.route} 
                        onValueChange={(value) => updateCustomDrug(index, 'route', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                          <SelectItem value="IV">IV (Intravenous)</SelectItem>
                          <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                          <SelectItem value="PO">PO (Oral)</SelectItem>
                          <SelectItem value="IN">IN (Intranasal)</SelectItem>
                          <SelectItem value="IM/IV">IM/IV (Combined)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Reversal Drugs Section */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUturnLeftIcon className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-600">Reversal Drugs</h3>
              </div>
              <Button 
                onClick={addReversalDrug} 
                size="sm" 
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Reversal Drug
              </Button>
            </div>
            
            {showReversalDrugs && reversalDrugs.length > 0 && (
              <div className="space-y-4 border border-amber-200 p-4 rounded bg-amber-50">
                {reversalDrugs.map((drug, index) => (
                  <div key={index} className="space-y-3 pt-3 border-t border-amber-200 first:border-0 first:pt-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Reversal Drug {index + 1}</h4>
                      <button 
                        onClick={() => removeReversalDrug(index)}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Drug</Label>
                        <Select 
                          value={drug.drugName} 
                          onValueChange={(value) => updateReversalDrug(index, 'drugName', value)}
                        >
                          <SelectTrigger className="border-amber-300 focus:ring-amber-500">
                            <SelectValue placeholder="Select reversal drug" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AVAILABLE_DRUGS)
                              .filter(([_, name]) => DRUG_CATEGORY_MAP[name] === DRUG_CATEGORIES.REVERSAL)
                              .map(([key, name]) => (
                                <SelectItem key={key} value={name}>{name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Concentration (mg/ml)</Label>
                          <Input 
                            type="number" 
                            value={drug.concentration} 
                            onChange={(e) => updateReversalDrug(index, 'concentration', e.target.value)}
                            min="0"
                            step="0.1"
                            className="border-amber-300 focus:ring-amber-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <Label>Min Dose</Label>
                            <Input 
                              type="number" 
                              value={drug.minDose} 
                              onChange={(e) => updateReversalDrug(index, 'minDose', e.target.value)}
                              min="0"
                              step="0.01"
                              className="border-amber-300 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <Label>Max Dose</Label>
                            <Input 
                              type="number" 
                              value={drug.maxDose} 
                              onChange={(e) => updateReversalDrug(index, 'maxDose', e.target.value)}
                              min="0"
                              step="0.01"
                              className="border-amber-300 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Route</Label>
                        <Select 
                          value={drug.route} 
                          onValueChange={(value) => updateReversalDrug(index, 'route', value)}
                        >
                          <SelectTrigger className="border-amber-300 focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                            <SelectItem value="IV">IV (Intravenous)</SelectItem>
                            <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                            <SelectItem value="PO">PO (Oral)</SelectItem>
                            <SelectItem value="IN">IN (Intranasal)</SelectItem>
                            <SelectItem value="IM/IV">IM/IV (Combined)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Emergency Drugs Section */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-600">Emergency Drugs</h3>
              </div>
              <Button 
                onClick={addEmergencyDrug} 
                size="sm" 
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Emergency Drug
              </Button>
            </div>
            
            {showEmergencyDrugs && emergencyDrugs.length > 0 && (
              <div className="space-y-4 border border-red-200 p-4 rounded bg-red-50">
                {emergencyDrugs.map((drug, index) => (
                  <div key={index} className="space-y-3 pt-3 border-t border-red-200 first:border-0 first:pt-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Emergency Drug {index + 1}</h4>
                      <button 
                        onClick={() => removeEmergencyDrug(index)}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Drug</Label>
                        <Select 
                          value={drug.drugName} 
                          onValueChange={(value) => updateEmergencyDrug(index, 'drugName', value)}
                        >
                          <SelectTrigger className="border-red-300 focus:ring-red-500">
                            <SelectValue placeholder="Select emergency drug" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AVAILABLE_DRUGS)
                              .filter(([_, name]) => DRUG_CATEGORY_MAP[name] === DRUG_CATEGORIES.EMERGENCY)
                              .map(([key, name]) => (
                                <SelectItem key={key} value={name}>{name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Concentration (mg/ml)</Label>
                          <Input 
                            type="number" 
                            value={drug.concentration} 
                            onChange={(e) => updateEmergencyDrug(index, 'concentration', e.target.value)}
                            min="0"
                            step="0.1"
                            className="border-red-300 focus:ring-red-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <Label>Min Dose</Label>
                            <Input 
                              type="number" 
                              value={drug.minDose} 
                              onChange={(e) => updateEmergencyDrug(index, 'minDose', e.target.value)}
                              min="0"
                              step="0.01"
                              className="border-red-300 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <Label>Max Dose</Label>
                            <Input 
                              type="number" 
                              value={drug.maxDose} 
                              onChange={(e) => updateEmergencyDrug(index, 'maxDose', e.target.value)}
                              min="0"
                              step="0.01"
                              className="border-red-300 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Route</Label>
                        <Select 
                          value={drug.route} 
                          onValueChange={(value) => updateEmergencyDrug(index, 'route', value)}
                        >
                          <SelectTrigger className="border-red-300 focus:ring-red-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                            <SelectItem value="IV">IV (Intravenous)</SelectItem>
                            <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                            <SelectItem value="PO">PO (Oral)</SelectItem>
                            <SelectItem value="IN">IN (Intranasal)</SelectItem>
                            <SelectItem value="IM/IV">IM/IV (Combined)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={calculateDosages} 
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700" 
            disabled={!weight || (useCustomDrugs && customDrugs.length === 0 && reversalDrugs.length === 0 && emergencyDrugs.length === 0)}
          >
            <CalculatorIcon className="h-4 w-4 mr-2" />
            Calculate Dosages
          </Button>
        </div>

        <div>
          {results.length > 0 ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Calculated Dosages</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose (mg)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (ml)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => {
                      // Get category styling
                      let categoryStyle = "";
                      let categoryBadge = "";
                      
                      if (result.category === DRUG_CATEGORIES.PRIMARY) {
                        categoryStyle = "bg-emerald-100 text-emerald-800";
                        categoryBadge = "Primary";
                      } else if (result.category === DRUG_CATEGORIES.REVERSAL) {
                        categoryStyle = "bg-amber-100 text-amber-800";
                        categoryBadge = "Reversal";
                      } else if (result.category === DRUG_CATEGORIES.EMERGENCY) {
                        categoryStyle = "bg-red-100 text-red-800";
                        categoryBadge = "Emergency";
                      } else {
                        categoryStyle = "bg-gray-100 text-gray-800";
                        categoryBadge = "Other";
                      }
                      
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryStyle}`}>
                              {categoryBadge}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{result.drug} ({result.concentration} mg/ml)</td>
                          <td className="px-4 py-2 whitespace-nowrap">{result.doseMg.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{result.volumeMl.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{result.route}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Weight: {weight} kg | {useCustomDrugs ? 'Custom Drug Protocol' : `Species: ${SPECIES_PROTOCOLS[species]?.speciesName}`}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 shadow-sm rounded-lg p-6 flex flex-col items-center justify-center h-64 text-center">
              <CalculatorIcon className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No dosages calculated yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Select an animal or species, enter weight, and calculate dosages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
