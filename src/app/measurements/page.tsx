'use client';

import { useState, useEffect } from 'react';
import { Animal, ImmobilizationEvent, Measurement } from '@/types';
import { saveFormState, loadFormState } from '@/utils/formPersistence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MeasurementsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [events, setEvents] = useState<ImmobilizationEvent[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [fields, setFields] = useState({
    totalLength: '',
    tailLength: '',
    shoulderHeight: '',
    chestGirth: '',
    neckCircumference: '',
    weight: '',
    upperCanineLength: '',
    lowerCanineLength: '',
    intercanineDistanceUpper: '',
    intercanineDistanceLower: '',
    notes: '',
  });

  useEffect(() => {
    const savedAnimals = localStorage.getItem('animals');
    if (savedAnimals) setAnimals(JSON.parse(savedAnimals));
    const savedEvents = localStorage.getItem('immobilizationEvents');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    const savedMeasurements = localStorage.getItem('measurements');
    if (savedMeasurements) setMeasurements(JSON.parse(savedMeasurements));
    
    // Load saved form state when component mounts
    const savedFormState = loadFormState('measurements', {
      animalId: '',
      eventId: '',
      fields: fields
    });
    
    if (savedFormState) {
      setSelectedAnimalId(savedFormState.animalId || '');
      setSelectedEventId(savedFormState.eventId || '');
      if (savedFormState.fields) {
        setFields({
          ...fields,
          ...savedFormState.fields
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('measurements', JSON.stringify(measurements));
  }, [measurements]);
  
  // Save form state whenever relevant fields change
  useEffect(() => {
    // Save current form state to persist between tabs
    saveFormState('measurements', {
      animalId: selectedAnimalId,
      eventId: selectedEventId,
      fields: fields
    });
  }, [selectedAnimalId, selectedEventId, fields]);

  const handleSave = () => {
    if (!selectedAnimalId || !selectedEventId) {
      alert('Select animal and event');
      return;
    }
    const newMeasurement: Measurement = {
      id: `meas-${Date.now()}`,
      animalId: selectedAnimalId,
      eventId: selectedEventId,
      timestamp: new Date(),
      measurements: {
        totalLength: fields.totalLength ? Number(fields.totalLength) : undefined,
        tailLength: fields.tailLength ? Number(fields.tailLength) : undefined,
        shoulderHeight: fields.shoulderHeight ? Number(fields.shoulderHeight) : undefined,
        chestGirth: fields.chestGirth ? Number(fields.chestGirth) : undefined,
        neckCircumference: fields.neckCircumference ? Number(fields.neckCircumference) : undefined,
        weight: fields.weight ? Number(fields.weight) : undefined,
        upperCanineLength: fields.upperCanineLength ? Number(fields.upperCanineLength) : undefined,
        lowerCanineLength: fields.lowerCanineLength ? Number(fields.lowerCanineLength) : undefined,
        intercanineDistanceUpper: fields.intercanineDistanceUpper ? Number(fields.intercanineDistanceUpper) : undefined,
        intercanineDistanceLower: fields.intercanineDistanceLower ? Number(fields.intercanineDistanceLower) : undefined,
      },
      notes: fields.notes,
    };
    setMeasurements([newMeasurement, ...measurements]);
    setFields({
      totalLength: '',
      tailLength: '',
      shoulderHeight: '',
      chestGirth: '',
      neckCircumference: '',
      weight: '',
      upperCanineLength: '',
      lowerCanineLength: '',
      intercanineDistanceUpper: '',
      intercanineDistanceLower: '',
      notes: '',
    });
  };

  const filteredEvents = events.filter(e => e.animalId === selectedAnimalId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Morphometric Measurements</h1>
      <div className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto space-y-4">
        <div>
          <Label htmlFor="animal">Animal</Label>
          <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
            <SelectTrigger>
              <SelectValue placeholder="Select animal" />
            </SelectTrigger>
            <SelectContent>
              {animals.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name || a.species}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="event">Immobilization Event</Label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={!selectedAnimalId}>
            <SelectTrigger>
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {filteredEvents.map(e => (
                <SelectItem key={e.id} value={e.id}>
                  {new Date(e.startTime).toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Total Length (cm)</Label>
            <Input type="number" value={fields.totalLength} onChange={e => setFields(f => ({...f, totalLength: e.target.value}))} />
          </div>
          <div>
            <Label>Tail Length (cm)</Label>
            <Input type="number" value={fields.tailLength} onChange={e => setFields(f => ({...f, tailLength: e.target.value}))} />
          </div>
          <div>
            <Label>Shoulder Height (cm)</Label>
            <Input type="number" value={fields.shoulderHeight} onChange={e => setFields(f => ({...f, shoulderHeight: e.target.value}))} />
          </div>
          <div>
            <Label>Chest Girth (cm)</Label>
            <Input type="number" value={fields.chestGirth} onChange={e => setFields(f => ({...f, chestGirth: e.target.value}))} />
          </div>
          <div>
            <Label>Neck Circumference (cm)</Label>
            <Input type="number" value={fields.neckCircumference} onChange={e => setFields(f => ({...f, neckCircumference: e.target.value}))} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={fields.weight} onChange={e => setFields(f => ({...f, weight: e.target.value}))} />
          </div>
          <div>
            <Label>Upper Canine Length (mm)</Label>
            <Input type="number" value={fields.upperCanineLength} onChange={e => setFields(f => ({...f, upperCanineLength: e.target.value}))} />
          </div>
          <div>
            <Label>Lower Canine Length (mm)</Label>
            <Input type="number" value={fields.lowerCanineLength} onChange={e => setFields(f => ({...f, lowerCanineLength: e.target.value}))} />
          </div>
          <div>
            <Label>Intercanine Distance Upper (mm)</Label>
            <Input type="number" value={fields.intercanineDistanceUpper} onChange={e => setFields(f => ({...f, intercanineDistanceUpper: e.target.value}))} />
          </div>
          <div>
            <Label>Intercanine Distance Lower (mm)</Label>
            <Input type="number" value={fields.intercanineDistanceLower} onChange={e => setFields(f => ({...f, intercanineDistanceLower: e.target.value}))} />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <textarea className="w-full border rounded-md px-2 py-1" value={fields.notes} onChange={e => setFields(f => ({...f, notes: e.target.value}))} rows={2} />
        </div>
        <Button onClick={handleSave} className="w-full">Save Measurement</Button>
      </div>
      {measurements.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto mt-8">
          <h2 className="font-semibold mb-2">Recent Measurements</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Upper Canine</th>
                  <th className="px-2 py-1">Lower Canine</th>
                  <th className="px-2 py-1">Animal</th>
                  <th className="px-2 py-1">Total</th>
                  <th className="px-2 py-1">Tail</th>
                  <th className="px-2 py-1">Shoulder</th>
                  <th className="px-2 py-1">Chest</th>
                  <th className="px-2 py-1">Neck</th>
                  <th className="px-2 py-1">Weight</th>
                  <th className="px-2 py-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 10).map((m, i) => {
                  const animal = animals.find(a => a.id === m.animalId);
                  return (
                    <tr key={m.id} className="border-t">
                      <td className="px-2 py-1">{new Date(m.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-1">{m.measurements.upperCanineLength ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.lowerCanineLength ?? '—'}</td>
                      <td className="px-2 py-1">{animal?.name || animal?.species || '—'}</td>
                      <td className="px-2 py-1">{m.measurements.totalLength ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.tailLength ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.shoulderHeight ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.chestGirth ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.neckCircumference ?? '—'}</td>
                      <td className="px-2 py-1">{m.measurements.weight ?? '—'}</td>
                      <td className="px-2 py-1">{m.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
