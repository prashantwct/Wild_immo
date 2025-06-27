'use client';

import { useState, useEffect } from 'react';
import { Animal, ImmobilizationEvent, Measurement, DrugDosage } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { calculateAllDrugs, getSpeciesProtocol } from '@/utils/drugCalculations';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

function toCSV(rows: any[], columns: string[]): string {
  const csvRows = [columns.join(',')];
  for (const row of rows) {
    const line = columns.map(col => {
      let val = row[col];
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n')))
        val = '"' + val.replace(/"/g, '""') + '"';
      return val ?? '';
    });
    csvRows.push(line.join(','));
  }
  return csvRows.join('\r\n');
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// Helper function to format dates consistently
function formatDate(dateStr: string | Date) {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleString();
}

// Generate comprehensive report that combines animal, event, measurements, and drug data
function generateFullReport(
  animalId: string, 
  eventId: string, 
  animals: Animal[], 
  events: ImmobilizationEvent[], 
  measurements: Measurement[]
): string {
  try {
    // Find the specific animal and event
    const animal = animals.find(a => a.id === animalId);
    const event = events.find(e => e.id === eventId);
    const eventMeasurements = measurements.filter(m => m.eventId === eventId);
    
    if (!animal) {
      return 'Error: Animal not found.';
    }
    
    if (!event) {
      return 'Error: Immobilization event not found.';
    }
    
    // Calculate drug dosages based on animal's weight
    let drugDosageDetails = 'No dosage data available';
    if (animal.estimatedWeight && animal.species) {
      try {
        // @ts-ignore - calculateAllDrugs might be defined elsewhere
        if (typeof calculateAllDrugs === 'function') {
          const dosages = calculateAllDrugs(animal.species, animal.estimatedWeight);
          if (dosages && Array.isArray(dosages)) {
            drugDosageDetails = dosages.map(d => {
              return `${d.drug.name} (${d.drug.concentration} mg/ml): ${d.doseMg?.toFixed(2) || 'N/A'} mg / ${d.volumeMl?.toFixed(2) || 'N/A'} ml (${d.drug.route})`;
            }).join('\n');
          }
        }
      } catch (error) {
        console.error('Error calculating drug dosages:', error);
        drugDosageDetails = 'Error calculating dosages';
      }
    }
    
    // Extract measurements into readable format
    let measurementDetails = 'No measurements recorded';
    if (eventMeasurements && eventMeasurements.length > 0) {
      measurementDetails = eventMeasurements.map((m, index) => {
        if (!m.measurements || Object.keys(m.measurements).length === 0) {
          return `Measurement Set ${index + 1}: No measurement data`;
        }
        
        const measurementStr = Object.entries(m.measurements)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 0)
          .map(([key, value]) => {
            // Format specific measurements with units
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
              
            switch(key) {
              case 'weight': 
                return `• Weight: ${value} kg`;
              case 'totalLength':
              case 'tailLength':
              case 'shoulderHeight':
              case 'chestGirth':
              case 'neckCircumference':
                return `• ${formattedKey}: ${value} cm`;
              case 'upperCanineLength':
              case 'lowerCanineLength':
              case 'upperCanineWidth':
              case 'lowerCanineWidth':
              case 'intercanineDistanceUpper':
              case 'intercanineDistanceLower':
                return `• ${formattedKey}: ${value} mm`;
              default:
                return `• ${formattedKey}: ${value}`;
            }
          })
          .join('\n  ');
          
        return `Measurement Set ${index + 1} - ${formatDate(m.timestamp)}:\n  ${measurementStr}\n  ${m.notes ? `Notes: ${m.notes}` : ''}`;
      }).join('\n\n');
    } else {
      // Add a note if no measurements were taken
      measurementDetails = 'No measurements were recorded for this event.';
    }
    
    // Extract vitals information
    let vitalsLog = 'No vitals recorded';
    if (event.vitals && event.vitals.length > 0) {
      vitalsLog = event.vitals.map(v => {
        const vitalsStr = [
          `Time: ${formatDate(v.time)}`,
          v.heartRate !== undefined ? `Heart Rate: ${v.heartRate} bpm` : null,
          v.respirationRate !== undefined ? `Respiration: ${v.respirationRate} bpm` : null,
          v.temperature !== undefined ? `Temperature: ${v.temperature}°C` : null,
          v.capillaryRefillTime !== undefined ? `CRT: ${v.capillaryRefillTime} sec` : null,
          v.oxygenSaturation !== undefined ? `SpO2: ${v.oxygenSaturation}%` : null,
          v.notes ? `Notes: ${v.notes}` : null
        ].filter(Boolean).join(', ');
        return vitalsStr;
      }).join('\n');
    }
    
    // Extract administered drugs
    let drugsAdministered = 'No drugs recorded';
    if (event.drugsAdministered && event.drugsAdministered.length > 0) {
      drugsAdministered = event.drugsAdministered.map((drug, index) => {
        return `${index + 1}. ${drug.drugName || 'Unknown Drug'}\n` +
               `   - Volume: ${drug.volume || '?'} ml\n` +
               `   - Concentration: ${drug.concentration || '?'} mg/ml\n` +
               `   - Route: ${drug.route || 'Not specified'}\n` +
               `   - Time: ${formatDate(drug.time)}\n` +
               `   - Dose: ${drug.dose || '?'} ${drug.unit || 'units'}`;
      }).join('\n\n');
    } else {
      // Add a note if no drugs were recorded
      drugsAdministered = 'No drugs were recorded for this event.';
    }
    
    // Format phases if they exist
    let phasesInfo = 'No phase information available';
    if (event.phases && event.phases.length > 0) {
      phasesInfo = event.phases.map(phase => {
        const phaseName = phase.phase.replace('_', ' ');
        const startTime = formatDate(phase.startTime);
        const endTime = phase.endTime ? formatDate(phase.endTime) : 'In Progress';
        const duration = phase.endTime 
          ? ` (${Math.round((new Date(phase.endTime).getTime() - new Date(phase.startTime).getTime()) / 60000)} min)`
          : '';
        return `${phaseName}: ${startTime} - ${endTime}${duration}${phase.notes ? `\n  Notes: ${phase.notes}` : ''}`;
      }).join('\n');
    }
    
    // Compile the full report
    const report = `
# IMMOBILIZATION PROCEDURE REPORT

## Animal Information
Species: ${animal.species || 'Not specified'}
Identifier: ${animal.identifier || 'N/A'}
Name: ${animal.name || 'Not named'}
Sex: ${animal.sex || 'Unknown'}
Age Class: ${animal.ageClass || 'Unknown'}
Estimated Weight: ${animal.estimatedWeight ? `${animal.estimatedWeight} kg` : 'Not specified'}

## Immobilization Event
Start Time: ${formatDate(event.startTime)}
End Time: ${event.endTime ? formatDate(event.endTime) : 'Ongoing'}

## Event Phases
${phasesInfo}

## Drugs Administered
${drugsAdministered}

## Recommended Drug Dosages
${drugDosageDetails}

## Vital Signs Monitoring
${vitalsLog}

## Morphometric Measurements
${measurementDetails}

## Complications
${event.complications && event.complications.length > 0 ? event.complications.join('\n') : 'None reported'}

## Notes
${event.notes || 'No additional notes'}

## Report Generated
${formatDate(new Date())}
`;

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    return `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Convert report to PDF format (text-based as real PDF generation requires additional libraries)
function createTextBasedPDF(reportText: string): Blob {
  // In a real implementation, you might use a library like pdfmake or jspdf
  // For now, we'll just create a text file with .pdf extension
  return new Blob([reportText], { type: 'text/plain' });
}

export default function ExportPage() {
  const [status, setStatus] = useState('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [events, setEvents] = useState<ImmobilizationEvent[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<ImmobilizationEvent[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Load and parse data with proper error handling
      const loadData = (key: string, defaultValue: any) => {
        try {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
          console.error(`Error loading ${key}:`, error);
          return defaultValue;
        }
      };

      const savedAnimals = loadData('animals', []);
      const savedEvents = loadData('immobilizationEvents', []);
      const savedMeasurements = loadData('measurements', []);

      // Convert string dates back to Date objects
      const parseDates = (events: any[]) => {
        return events.map(event => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: event.endTime ? new Date(event.endTime) : undefined,
          vitals: event.vitals?.map((v: any) => ({
            ...v,
            time: new Date(v.time)
          })) || [],
          phases: event.phases?.map((p: any) => ({
            ...p,
            startTime: new Date(p.startTime),
            endTime: p.endTime ? new Date(p.endTime) : undefined
          })) || [],
          drugsAdministered: event.drugsAdministered?.map((d: any) => ({
            ...d,
            time: new Date(d.time)
          })) || []
        }));
      };

      setAnimals(savedAnimals);
      setEvents(parseDates(savedEvents));
      setMeasurements(savedMeasurements.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('Error loading data. Please check the console for details.');
    }
  }, []);

  // Update filtered events when animal selection changes
  useEffect(() => {
    if (selectedAnimalId) {
      const animalEvents = events.filter(event => event.animalId === selectedAnimalId);
      setFilteredEvents(animalEvents);
      setSelectedEventId(''); // Reset event selection
    } else {
      setFilteredEvents([]);
      setSelectedEventId('');
    }
  }, [selectedAnimalId, events]);

  // Handle basic data export (CSV)
  const handleExport = (type: 'animals' | 'events' | 'measurements') => {
    let data: any[] = [];
    let columns: string[] = [];
    let filename = '';
    if (type === 'animals') {
      data = animals;
      columns = ['id', 'species', 'name', 'identifier', 'sex', 'ageClass', 'estimatedWeight', 'location', 'notes', 'createdAt', 'updatedAt'];
      filename = 'animals.csv';
    } else if (type === 'events') {
      data = events;
      columns = ['id', 'animalId', 'startTime', 'endTime', 'drugsAdministered', 'vitals', 'complications', 'notes'];
      filename = 'immobilization_events.csv';
    } else if (type === 'measurements') {
      data = measurements;
      columns = ['id', 'animalId', 'eventId', 'timestamp', 'measurements', 'notes'];
      filename = 'measurements.csv';
    }
    if (!data.length) {
      setStatus('No data to export.');
      return;
    }
    const csv = toCSV(data, columns);
    downloadCSV(filename, csv);
    setStatus('Exported ' + filename);
  };

  // Generate and export comprehensive immobilization report
  const handleGenerateReport = () => {
    try {
      if (!selectedAnimalId || !selectedEventId) {
        setStatus('Please select an animal and an immobilization event.');
        return;
      }

      const animal = animals.find(a => a.id === selectedAnimalId);
      const event = events.find(e => e.id === selectedEventId);
      
      if (!animal) {
        setStatus('Error: Selected animal not found.');
        return;
      }
      
      if (!event) {
        setStatus('Error: Selected immobilization event not found.');
        return;
      }

      // Generate the report
      const report = generateFullReport(
        selectedAnimalId,
        selectedEventId,
        animals,
        events,
        measurements
      );

      // Check if there was an error generating the report
      if (report.startsWith('Error:')) {
        setStatus(report);
        return;
      }

      // Create a more readable filename
      const eventDate = new Date(event.startTime);
      const dateStr = eventDate.toISOString().split('T')[0];
      const animalName = (animal.name || animal.identifier || animal.species || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');
      
      // Create and download the report file
      const blob = createTextBasedPDF(report);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `immobilization_report_${animalName}_${dateStr}.md`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      setStatus(`Successfully exported report for ${animal.name || animal.species || 'animal'} (${dateStr})`);
    } catch (error) {
      console.error('Error generating report:', error);
      setStatus(`Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Export Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Basic Data Export</h2>
          <p className="text-sm text-gray-500">Export raw data in CSV format</p>
          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => handleExport('animals')}>
              Export Animals CSV
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleExport('events')}>
              Export Immobilization Events CSV
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleExport('measurements')}>
              Export Measurements CSV
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Immobilization Procedure Reports</h2>
          <p className="text-sm text-gray-500">Generate comprehensive reports for specific immobilization events</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="animal">Select Animal</Label>
              <Select
                value={selectedAnimalId}
                onValueChange={setSelectedAnimalId}
              >
                <SelectTrigger>
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event">Select Immobilization Event</Label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
                disabled={!selectedAnimalId || filteredEvents.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filteredEvents.length === 0 ? "No events available" : "Select an event"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {new Date(event.startTime).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGenerateReport}
              disabled={!selectedAnimalId || !selectedEventId}
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Generate Immobilization Report
            </Button>
          </div>
        </div>
      </div>
      
      {status && <div className="mt-4 p-2 bg-green-50 text-green-700 rounded text-center">{status}</div>}
    </div>
  );
}
