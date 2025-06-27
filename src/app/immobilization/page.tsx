'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportToJson, exportToCsv } from '@/utils/exportUtils';
import { saveFormState, loadFormState } from '@/utils/formPersistence';
import { Animal, ImmobilizationEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ImmobilizationPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [activeEvent, setActiveEvent] = useState<ImmobilizationEvent | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: '',
    respirationRate: '',
    temperature: '',
    capillaryRefillTime: '',
    oxygenSaturation: '',
    notes: '',
  });

  // Drug calculation state
  const [drugForm, setDrugForm] = useState({
    drugName: 'Ketamine',
    concentration: '100',
    dosePerKg: '5',
    animalWeight: '',
    volume: '',
    totalDose: '',
    route: 'IM',
    notes: ''
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [events, setEvents] = useState<ImmobilizationEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ImmobilizationEvent | null>(null);

  // Calculate drug dosage and automatically record it
  const calculateDosage = () => {
    const weight = parseFloat(drugForm.animalWeight);
    const dosePerKg = parseFloat(drugForm.dosePerKg);
    const concentration = parseFloat(drugForm.concentration);
    
    if (isNaN(weight) || isNaN(dosePerKg) || isNaN(concentration) || concentration === 0) {
      return;
    }

    const totalDose = weight * dosePerKg;
    const volume = totalDose / concentration;

    setDrugForm(prev => ({
      ...prev,
      totalDose: totalDose.toFixed(2),
      volume: volume.toFixed(2)
    }));
    
    // Automatically record the drug administration when calculation is complete
    if (activeEvent) {
      const newDrug = {
        drugName: drugForm.drugName,
        concentration: concentration,
        volume: volume,
        dose: totalDose,
        unit: 'mg',
        route: drugForm.route,
        time: new Date(),
        notes: drugForm.notes
      };

      const updatedEvent = {
        ...activeEvent,
        drugsAdministered: [...(activeEvent.drugsAdministered || []), newDrug]
      };

      setActiveEvent(updatedEvent);
      
      // Update events in state and localStorage
      const updatedEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      setEvents(updatedEvents);
      localStorage.setItem('immobilizationEvents', JSON.stringify(updatedEvents));
    }
  };

  // Handle drug form input changes
  const handleDrugInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDrugForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Recalculate if weight or dose per kg changes
    if (name === 'animalWeight' || name === 'dosePerKg' || name === 'concentration') {
      calculateDosage();
    }
  };

  // Record induction phase
  const recordInductionPhase = () => {
    if (!activeEvent) return;
    recordPhase('induction', 'Induction phase started');
  };

  // Record recovery phase
  const recordRecoveryPhase = () => {
    if (!activeEvent) return;
    recordPhase('recovery', 'Recovery phase started');
  };
  
  // Clear the drug form
  const clearDrugForm = () => {
    setDrugForm(prev => ({
      ...prev,
      animalWeight: '',
      notes: '',
      totalDose: '',
      volume: ''
    }));
  };

  useEffect(() => {
    const savedAnimals = localStorage.getItem('animals');
    if (savedAnimals) setAnimals(JSON.parse(savedAnimals));
    const savedEvents = localStorage.getItem('immobilizationEvents');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    
    // Load saved form state
    const savedFormState = loadFormState('immobilizationVitals', {
      animalId: '',
      activeEventData: null
    });
    
    if (savedFormState && savedFormState.animalId) {
      setSelectedAnimalId(savedFormState.animalId);
    }
    
    if (savedFormState && savedFormState.activeEventData) {
      setActiveEvent(savedFormState.activeEventData);
      // Calculate elapsed time if the event is ongoing
      if (savedFormState.activeEventData.startTime) {
        const startTimeMs = new Date(savedFormState.activeEventData.startTime).getTime();
        const now = Date.now();
        const elapsedMs = now - startTimeMs;
        setElapsedTime(Math.floor(elapsedMs / 1000));
        setIsRunning(true); // Resume timer
      }
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) localStorage.setItem('immobilizationEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const startEvent = () => {
    if (!selectedAnimalId) return alert('Select an animal');
    const startTime = new Date();
    const newEvent: ImmobilizationEvent = {
      id: `event-${Date.now()}`,
      animalId: selectedAnimalId,
      startTime,
      phases: [{
        phase: 'induction',
        startTime,
        notes: 'Induction phase started'
      }],
      vitals: [],
    };
    
    setActiveEvent(newEvent);
    setElapsedTime(0);
    setIsRunning(true);
    
    saveFormState('immobilizationVitals', {
      animalId: selectedAnimalId,
      activeEventData: newEvent
    });
  };

  const recordPhase = (phase: ImmobilizationEvent['phases'][0]['phase'], notes: string = '') => {
    if (!activeEvent) return;
    
    const currentTime = new Date();
    
    // End the current phase if there is one
    const updatedPhases = [...(activeEvent.phases || [])];
    const currentPhaseIndex = updatedPhases.length - 1;
    if (currentPhaseIndex >= 0) {
      updatedPhases[currentPhaseIndex] = {
        ...updatedPhases[currentPhaseIndex],
        endTime: currentTime,
        notes: updatedPhases[currentPhaseIndex].notes || notes
      };
    }
    
    // Start the new phase
    updatedPhases.push({
      phase,
      startTime: currentTime,
      notes
    });
    
    const updatedEvent = {
      ...activeEvent,
      phases: updatedPhases
    };
    
    setActiveEvent(updatedEvent);
    
    // If this is the recovery_complete phase, end the event
    if (phase === 'recovery_complete') {
      endEvent(updatedEvent);
    }
    
    // Save to form state
    saveFormState('immobilizationVitals', {
      animalId: selectedAnimalId,
      activeEventData: updatedEvent
    });
  };

  const pauseEvent = () => setIsRunning(false);
  const resumeEvent = () => setIsRunning(true);

  const recordVitals = () => {
    if (!activeEvent) return;
    
    const newVital = {
      time: new Date(),
      heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
      respirationRate: vitals.respirationRate ? Number(vitals.respirationRate) : undefined,
      temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
      capillaryRefillTime: vitals.capillaryRefillTime ? Number(vitals.capillaryRefillTime) : undefined,
      oxygenSaturation: vitals.oxygenSaturation ? Number(vitals.oxygenSaturation) : undefined,
      notes: vitals.notes,
    };

    const updatedEvent = {
      ...activeEvent,
      vitals: [...(activeEvent.vitals || []), newVital]
    };

    setActiveEvent(updatedEvent);
    
    // Update events in state and localStorage
    const updatedEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updatedEvents);
    localStorage.setItem('immobilizationEvents', JSON.stringify(updatedEvents));
    
    // Clear the form
    setVitals({
      heartRate: '',
      respirationRate: '',
      temperature: '',
      capillaryRefillTime: '',
      oxygenSaturation: '',
      notes: '',
    });
  };

  const endEvent = (eventToEndOrEvent: ImmobilizationEvent | React.MouseEvent<HTMLButtonElement> | undefined = activeEvent) => {
    // Handle both direct calls and button click events
    const eventToEnd = eventToEndOrEvent && 'preventDefault' in eventToEndOrEvent ? activeEvent : eventToEndOrEvent as ImmobilizationEvent | null;
    
    if (!eventToEnd) return;
    
    // Make sure the last phase is properly ended
    const updatedPhases = [...(eventToEnd.phases || [])];
    const currentPhaseIndex = updatedPhases.length - 1;
    if (currentPhaseIndex >= 0 && !updatedPhases[currentPhaseIndex].endTime) {
      updatedPhases[currentPhaseIndex] = {
        ...updatedPhases[currentPhaseIndex],
        endTime: new Date()
      };
    }
    
    const completedEvent = {
      ...eventToEnd,
      phases: updatedPhases,
      endTime: new Date(),
      status: 'completed' as const,
    };

    const updatedEvents = [...events, completedEvent];
    setEvents(updatedEvents);
    setActiveEvent(null);
    setSelectedEvent(completedEvent);
    setIsRunning(false);
    
    localStorage.setItem('immobilizationEvents', JSON.stringify(updatedEvents));
    
    saveFormState('immobilizationVitals', {
      animalId: '',
      activeEventData: null
    });
  };

  // Helper function to get the current phase at a specific time
  const getPhaseAtTime = (event: ImmobilizationEvent, time: Date) => {
    if (!event.phases?.length) return null;
    return event.phases.find(phase => 
      new Date(phase.startTime) <= time && 
      (!phase.endTime || new Date(phase.endTime) >= time)
    );
  };

  const exportEvent = (event: ImmobilizationEvent, format: 'json' | 'csv' = 'json') => {
    if (!event) return;
    
    const animal = animals.find(a => a.id === event.animalId);
    const eventData = {
      ...event,
      // Convert dates to ISO strings for JSON serialization
      startTime: event.startTime.toISOString(),
      endTime: event.endTime?.toISOString(),
      vitals: event.vitals.map(v => ({
        ...v,
        time: v.time.toISOString()
      })),
      phases: event.phases?.map(p => ({
        ...p,
        startTime: p.startTime.toISOString(),
        endTime: p.endTime?.toISOString()
      })),
      // Add derived fields for convenience
      animalName: animal?.name || 'Unknown',
      species: animal?.species || 'Unknown',
      duration: event.endTime 
        ? `${Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000)} minutes`
        : 'Ongoing'
    };
    
    const filename = `immobilization-event-${event.id}-${animal?.name || 'unknown'}`;
    
    if (format === 'json') {
      exportToJson(eventData, filename);
    } else {
      // For CSV, create a detailed flattened version with all data points
      const flatData = [];
      
      // Add event metadata
      flatData.push({
        type: 'Event',
        field: 'Animal',
        value: animal?.name || 'Unknown',
        timestamp: ''
      }, {
        type: 'Event',
        field: 'Species',
        value: animal?.species || 'Unknown',
        timestamp: ''
      }, {
        type: 'Event',
        field: 'Start Time',
        value: new Date(event.startTime).toLocaleString(),
        timestamp: ''
      }, {
        type: 'Event',
        field: 'End Time',
        value: event.endTime ? new Date(event.endTime).toLocaleString() : 'In Progress',
        timestamp: ''
      });
      
      // Add phases with their timestamps
      event.phases?.forEach(phase => {
        flatData.push({
          type: 'Phase',
          field: phase.phase.replace('_', ' ').toUpperCase(),
          value: phase.notes || 'Started',
          timestamp: new Date(phase.startTime).toLocaleTimeString() + 
                   (phase.endTime ? ` - ${new Date(phase.endTime).toLocaleTimeString()}` : '')
        });
      });
      
      // Add all vitals with their timestamps and current phase
      event.vitals.forEach(vital => {
        const timestamp = new Date(vital.time);
        const currentPhase = getPhaseAtTime(event, timestamp);
        
        // Add each vital sign as a separate row with proper units
        if (vital.heartRate !== undefined) {
          flatData.push({
            type: 'Vital',
            field: 'Heart Rate',
            value: vital.heartRate,
            unit: 'bpm',
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
        
        if (vital.respirationRate !== undefined) {
          flatData.push({
            type: 'Vital',
            field: 'Respiration Rate',
            value: vital.respirationRate,
            unit: 'rpm',
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
        
        if (vital.temperature !== undefined) {
          flatData.push({
            type: 'Vital',
            field: 'Temperature',
            value: vital.temperature,
            unit: '°C',
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
        
        if (vital.oxygenSaturation !== undefined) {
          flatData.push({
            type: 'Vital',
            field: 'Oxygen Saturation',
            value: vital.oxygenSaturation,
            unit: '%',
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
        
        if (vital.capillaryRefillTime !== undefined) {
          flatData.push({
            type: 'Vital',
            field: 'Capillary Refill Time',
            value: vital.capillaryRefillTime,
            unit: 's',
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
        
        if (vital.notes) {
          flatData.push({
            type: 'Note',
            field: 'Notes',
            value: vital.notes,
            timestamp: timestamp.toLocaleTimeString(),
            phase: currentPhase?.phase || 'unknown'
          });
        }
      });
      
      // Add any event notes
      if (event.notes) {
        flatData.push({
          type: 'Event',
          field: 'Notes',
          value: event.notes,
          timestamp: ''
        });
      }
      
      // Define CSV columns based on the most complete record
      const csvColumns = ['Type', 'Field', 'Value', 'Unit', 'Timestamp', 'Phase'];
      
      exportToCsv(
        flatData,
        csvColumns,
        filename
      );
    }
  };

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-emerald-800 mb-6">Immobilization Monitoring</h1>
      
      {!activeEvent ? (
        <div className="bg-gradient-to-br from-white to-emerald-50 shadow-lg rounded-lg p-6 max-w-md mx-auto border border-emerald-100">
          <Label htmlFor="animal" className="text-emerald-700 font-medium">Select Animal *</Label>
          <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
            <SelectTrigger className="mt-1 border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue placeholder="Select an animal" />
            </SelectTrigger>
            <SelectContent>
              {animals.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name || animal.species} {animal.identifier ? `(${animal.identifier})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={startEvent} 
            disabled={!selectedAnimalId} 
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
          >
            <PlayIcon className="h-4 w-4 mr-2" /> Start Monitoring
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedAnimal?.name || selectedAnimal?.species}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Started: {new Date(activeEvent.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-mono bg-emerald-50 px-3 py-1.5 rounded-md">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="flex space-x-2">
                    {isRunning ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={pauseEvent}
                        className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                      >
                        <PauseIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resumeEvent}
                        className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => endEvent(activeEvent)}
                    >
                      <StopIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Drug Calculator */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Drug Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="drugName" className="text-blue-800">Drug</Label>
                    <select
                      id="drugName"
                      name="drugName"
                      value={drugForm.drugName}
                      onChange={handleDrugInputChange}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="Ketamine">Ketamine</option>
                      <option value="Medetomidine">Medetomidine</option>
                      <option value="Xylazine">Xylazine</option>
                      <option value="Butorphanol">Butorphanol</option>
                      <option value="Atipamezole">Atipamezole</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="concentration" className="text-blue-800">Concentration (mg/ml)</Label>
                    <Input
                      id="concentration"
                      name="concentration"
                      type="number"
                      step="0.1"
                      value={drugForm.concentration}
                      onChange={handleDrugInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosePerKg" className="text-blue-800">Dose (mg/kg)</Label>
                    <Input
                      id="dosePerKg"
                      name="dosePerKg"
                      type="number"
                      step="0.1"
                      value={drugForm.dosePerKg}
                      onChange={handleDrugInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="animalWeight" className="text-blue-800">Animal Weight (kg)</Label>
                    <Input
                      id="animalWeight"
                      name="animalWeight"
                      type="number"
                      step="0.1"
                      value={drugForm.animalWeight}
                      onChange={handleDrugInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalDose" className="text-blue-800">Total Dose (mg)</Label>
                    <Input
                      id="totalDose"
                      name="totalDose"
                      type="text"
                      value={drugForm.totalDose}
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volume" className="text-blue-800">Volume (ml)</Label>
                    <Input
                      id="volume"
                      name="volume"
                      type="text"
                      value={drugForm.volume}
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="route" className="text-blue-800">Route</Label>
                    <select
                      id="route"
                      name="route"
                      value={drugForm.route}
                      onChange={handleDrugInputChange}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="IM">IM</option>
                      <option value="IV">IV</option>
                      <option value="SC">SC</option>
                      <option value="PO">PO</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="drugNotes" className="text-blue-800">Notes</Label>
                    <Input
                      id="drugNotes"
                      name="notes"
                      value={drugForm.notes}
                      onChange={handleDrugInputChange}
                      placeholder="Additional notes"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    onClick={clearDrugForm}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear Form
                  </Button>
                  <Button 
                    onClick={recordInductionPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Record Induction Phase
                  </Button>
                  <Button 
                    onClick={recordRecoveryPhase}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Record Recovery Phase
                  </Button>
                </div>
              </div>

              {/* Vitals Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Record Vitals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                      placeholder="HR"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="respirationRate">Respiration (rpm)</Label>
                    <Input
                      id="respirationRate"
                      type="number"
                      value={vitals.respirationRate}
                      onChange={(e) => setVitals({...vitals, respirationRate: e.target.value})}
                      placeholder="RR"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Temp (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                      placeholder="Temp"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      value={vitals.oxygenSaturation}
                      onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})}
                      placeholder="SpO2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capillaryRefillTime">CRT (s)</Label>
                    <Input
                      id="capillaryRefillTime"
                      type="number"
                      step="0.1"
                      value={vitals.capillaryRefillTime}
                      onChange={(e) => setVitals({...vitals, capillaryRefillTime: e.target.value})}
                      placeholder="CRT"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="vitalNotes">Notes</Label>
                    <Input
                      id="vitalNotes"
                      value={vitals.notes}
                      onChange={(e) => setVitals({...vitals, notes: e.target.value})}
                      placeholder="Additional notes"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={recordVitals} 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!vitals.heartRate && !vitals.respirationRate && !vitals.temperature && !vitals.oxygenSaturation}
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Record Vitals
                </Button>
              </div>

              {/* Administered Drugs */}
              {activeEvent.drugsAdministered && activeEvent.drugsAdministered.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-lg font-semibold mb-3">Administered Drugs</h3>
                  <div className="space-y-2">
                    {activeEvent.drugsAdministered.map((drug, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-blue-900">
                              {drug.drugName} - {drug.dose} {drug.unit}
                            </span>
                            <div className="text-sm text-blue-700 mt-1">
                              {drug.route} • {new Date(drug.time).toLocaleTimeString()}
                              {drug.concentration > 0 && (
                                <span> • {drug.concentration}mg/ml</span>
                              )}
                              {drug.volume > 0 && (
                                <span> • {drug.volume}ml</span>
                              )}
                            </div>
                            {drug.notes && (
                              <p className="text-sm text-blue-800 mt-1">{drug.notes}</p>
                            )}
                            {drug.sample && (
                              <div className="mt-2 pt-2 border-t border-blue-100">
                                <div className="text-xs font-medium text-blue-900">
                                  Sample: {drug.sample.type.charAt(0).toUpperCase() + drug.sample.type.slice(1)}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {new Date(drug.sample.time).toLocaleString()}
                                  {drug.sample.notes && (
                                    <p className="text-xs text-blue-800 mt-1">{drug.sample.notes}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Export Options</h3>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => exportEvent(activeEvent, 'json')}
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => exportEvent(activeEvent, 'csv')}
                    className="border-blue-500 text-blue-700 hover:bg-blue-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h3>
              <div className="space-y-4">
                {/* Vitals History */}
                {activeEvent.vitals && activeEvent.vitals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vitals History</h4>
                    <div className="space-y-2">
                      {activeEvent.vitals.map((vital, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(vital.time).toLocaleTimeString()}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {vital.heartRate && <span>HR: {vital.heartRate} bpm</span>}
                                {vital.respirationRate && <span className="ml-3">RR: {vital.respirationRate} rpm</span>}
                                {vital.temperature && <span className="ml-3">Temp: {vital.temperature}°C</span>}
                                {vital.oxygenSaturation && <span className="ml-3">SpO2: {vital.oxygenSaturation}%</span>}
                                {vital.capillaryRefillTime && <span className="ml-3">CRT: {vital.capillaryRefillTime}s</span>}
                              </div>
                              {vital.notes && (
                                <p className="text-xs text-gray-600 mt-1">{vital.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Phases */}
                {activeEvent.phases && activeEvent.phases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Event Phases</h4>
                    <div className="space-y-2">
                      {activeEvent.phases.map((phase, index) => (
                        <div key={index} className="bg-emerald-50 p-3 rounded-md border border-emerald-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-medium text-emerald-900">
                                {phase.phase.replace('_', ' ').toUpperCase()}
                              </span>
                              <div className="text-xs text-emerald-700 mt-1">
                                {new Date(phase.startTime).toLocaleTimeString()}
                                {phase.endTime && (
                                  <span> - {new Date(phase.endTime).toLocaleTimeString()}</span>
                                )}
                              </div>
                              {phase.notes && (
                                <p className="text-xs text-emerald-800 mt-1">{phase.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
