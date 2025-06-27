export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
