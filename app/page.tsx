import { Suspense } from "react";
import { Playground } from "@/components/playground";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <Suspense fallback={<PlaygroundSkeleton />}>
        <Playground />
      </Suspense>
    </main>
  );
}

// Simple skeleton loader for the playground
function PlaygroundSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex justify-center my-4">
        <div className="h-32 w-32 bg-primary/10 rounded-md animate-pulse" />
      </div>
      <div className="h-6 w-2/3 mx-auto bg-muted rounded-md animate-pulse mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="h-[300px] bg-card border rounded-lg animate-pulse" />
        <div className="h-[300px] bg-card border rounded-lg animate-pulse" />
      </div>

      <div className="h-[400px] bg-card border rounded-lg animate-pulse" />
    </div>
  );
}
