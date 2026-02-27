import { useStudio } from "@/providers/studio-provider";

export function ModelHome() {
  const { models, isLoading, error } = useStudio();

  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold">Pick a model to start</p>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading schema..."
            : error
              ? "Backend unavailable"
              : `${models.length} models loaded`}
        </p>
      </div>
    </div>
  );
}
