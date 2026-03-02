import { Typography } from "@/components/ui/typography";
import { useStudio } from "@/providers/studio-provider";

export function ModelHome() {
  const { models, isLoading, error } = useStudio();

  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
      <div className="space-y-2 text-center">
        <Typography variant="large">Pick a model to start</Typography>
        <Typography variant="muted">
          {isLoading
            ? "Loading schema..."
            : error
              ? "Backend unavailable"
              : `${models.length} models loaded`}
        </Typography>
      </div>
    </div>
  );
}
