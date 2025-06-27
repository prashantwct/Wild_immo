'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => reset()}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  );
}
