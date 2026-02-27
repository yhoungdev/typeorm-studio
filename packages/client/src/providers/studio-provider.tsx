import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { studioApiClient } from "@/lib/studio-api";
import type { StudioModel } from "@/lib/types";

interface StudioProviderValue {
  models: StudioModel[];
  isLoading: boolean;
  error: string | null;
  connected: boolean;
  refreshSchema: () => Promise<void>;
}

const StudioContext = createContext<StudioProviderValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<StudioModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSchema = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const schema = await studioApiClient.getSchema();
      setModels(schema.models);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load schema";
      setError(message);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSchema();
  }, []);

  const value = useMemo<StudioProviderValue>(
    () => ({
      models,
      isLoading,
      error,
      connected: !isLoading && error == null,
      refreshSchema,
    }),
    [models, isLoading, error],
  );

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioProvider");
  }
  return context;
}
