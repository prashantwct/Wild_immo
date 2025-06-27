import { useState, useEffect } from 'react';
import { Animal } from '@/types';
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

interface AnimalFormProps {
  initialData?: Partial<Animal>;
  onSave: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function AnimalForm({ initialData, onSave, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState<Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>>({
    species: '',
    name: '',
    identifier: '',
    sex: 'unknown',
    ageClass: 'adult',
    estimatedWeight: undefined,
    location: undefined,
    notes: '',
  });

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        species: initialData.species || '',
        name: initialData.name || '',
        identifier: initialData.identifier || '',
        sex: initialData.sex || 'unknown',
        ageClass: initialData.ageClass || 'adult',
        estimatedWeight: initialData.estimatedWeight,
        location: initialData.location,
        notes: initialData.notes || '',
      });
      setLocationEnabled(!!initialData.location);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        }));
        setLocationEnabled(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to retrieve your location');
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.species.trim()) {
      alert('Species is required');
      return;
    }
    
    // Prepare the data to save
    const dataToSave = {
      ...formData,
      // Ensure estimatedWeight is a number or undefined
      estimatedWeight: formData.estimatedWeight ? Number(formData.estimatedWeight) : undefined,
      // Only include location if it's enabled
      location: locationEnabled ? formData.location : undefined,
    };
    
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="species">Species *</Label>
          <Input
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            placeholder="e.g., Lion (Panthera leo)"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., Simba"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="identifier">Identifier (optional)</Label>
          <Input
            id="identifier"
            name="identifier"
            value={formData.identifier || ''}
            onChange={handleChange}
            placeholder="e.g., Tag #1234"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select
            value={formData.sex}
            onValueChange={(value: 'male' | 'female' | 'unknown') => handleSelectChange('sex', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ageClass">Age Class</Label>
          <Select
            value={formData.ageClass}
            onValueChange={(value: 'cub' | 'subadult' | 'adult' | 'senior') => 
              handleSelectChange('ageClass', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cub">Cub</SelectItem>
              <SelectItem value="subadult">Subadult</SelectItem>
              <SelectItem value="adult">Adult</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estimatedWeight">Estimated Weight (kg)</Label>
          <Input
            id="estimatedWeight"
            name="estimatedWeight"
            type="number"
            min="0"
            step="0.1"
            value={formData.estimatedWeight || ''}
            onChange={handleNumberChange}
            placeholder="e.g., 45.5"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id="enableLocation"
            type="checkbox"
            checked={locationEnabled}
            onChange={(e) => {
              setLocationEnabled(e.target.checked);
              if (!e.target.checked) {
                setFormData(prev => ({ ...prev, location: undefined }));
              } else {
                getCurrentLocation();
              }
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <Label htmlFor="enableLocation">Record current location</Label>
        </div>
        {locationEnabled && formData.location && (
          <div className="text-sm text-gray-600 mt-1">
            Location: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
            {formData.location.accuracy && (
              <span className="text-gray-500"> (Accuracy: {Math.round(formData.location.accuracy)}m)</span>
            )}
            <button
              type="button"
              onClick={getCurrentLocation}
              className="ml-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Update
            </button>
          </div>
        )}
        {locationError && (
          <p className="text-sm text-red-600 mt-1">{locationError}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Any additional notes about this animal..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          {initialData ? 'Update' : 'Add'} Animal
        </Button>
      </div>
    </form>
  );
}
