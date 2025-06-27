'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Animal } from '@/types';
import AnimalForm from '@/components/AnimalForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);

  // Load animals from local storage
  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window !== 'undefined') {
      const savedAnimals = localStorage.getItem('animals');
      if (savedAnimals) {
        try {
          const parsed = JSON.parse(savedAnimals);
          // Convert string dates back to Date objects
          const animalsWithDates = parsed.map((animal: any) => ({
            ...animal,
            createdAt: new Date(animal.createdAt),
            updatedAt: new Date(animal.updatedAt),
          }));
          setAnimals(animalsWithDates);
        } catch (error) {
          console.error('Failed to parse animals from localStorage', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Save animals to local storage when they change
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('animals', JSON.stringify(animals));
    }
  }, [animals, isLoading]);

  const handleSaveAnimal = (animal: Animal) => {
    const now = new Date();
    
    if (currentAnimal) {
      // Update existing animal
      setAnimals(animals.map(a => 
        a.id === currentAnimal.id 
          ? { ...animal, updatedAt: now }
          : a
      ));
    } else {
      // Add new animal
      const newAnimal = {
        ...animal,
        id: `animal-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setAnimals([...animals, newAnimal]);
    }
    
    setCurrentAnimal(null);
    setIsFormOpen(false);
  };

  const handleEdit = (animal: Animal) => {
    setCurrentAnimal(animal);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this animal record?')) {
      setAnimals(animals.filter(animal => animal.id !== id));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animal Records</h1>
        <Button onClick={() => {
          setCurrentAnimal(null);
          setIsFormOpen(true);
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Animal
        </Button>
      </div>

      {animals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No animals found. Add your first animal record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identifier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sex
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.map((animal) => (
                <tr key={animal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{animal.species}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{animal.identifier || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{animal.sex || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {animal.estimatedWeight ? `${animal.estimatedWeight} kg` : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(animal.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(animal)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilIcon className="h-4 w-4 inline" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(animal.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4 inline" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAnimal ? 'Edit Animal' : 'Add New Animal'}
            </DialogTitle>
          </DialogHeader>
          <AnimalForm
            initialData={currentAnimal || undefined}
            onSave={handleSaveAnimal}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
