import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
