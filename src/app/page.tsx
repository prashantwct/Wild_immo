import Link from 'next/link';
import { MobileOptimizationDemo } from '@/components/MobileOptimizationDemo';

export default function Home() {
  const features = [
    {
      name: 'Animal Management',
      description: 'Register and manage animal records with detailed information',
      href: '/animals',
      icon: '🐾',
    },
    {
      name: 'Drug Calculator',
      description: 'Calculate accurate drug dosages based on species and weight',
      href: '/calculator',
      icon: '💊',
    },
    {
      name: 'Immobilization',
      description: 'Monitor and record immobilization events in real-time',
      href: '/immobilization',
      icon: '⏱️',
    },
    {
      name: 'Measurements',
      description: 'Record and track morphometric data',
      href: '/measurements',
      icon: '📏',
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Wildlife Management
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Immobilization & Monitoring System
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            A comprehensive solution for wildlife immobilization procedures and data collection.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="flex flex-col bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-1 text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-indigo-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-900">Offline Capable</h3>
          <p className="mt-2 text-indigo-700">
            This application works offline. All your data is stored locally and will sync when you're back online.
          </p>
        </div>
      </div>
      <div className="mt-16">
        <MobileOptimizationDemo />
      </div>
    </div>
  );
}
