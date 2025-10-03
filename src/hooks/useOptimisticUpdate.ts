import { useCallback, useState } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(
    async (
      optimisticData: T,
      asyncUpdate: () => Promise<T>
    ) => {
      const previousData = data;
      
      // Immediately update UI with optimistic data
      setData(optimisticData);
      setIsUpdating(true);

      try {
        // Perform actual update
        const result = await asyncUpdate();
        setData(result);
        options.onSuccess?.(result);
      } catch (error) {
        // Rollback on error
        setData(previousData);
        options.onError?.(error as Error);
      } finally {
        setIsUpdating(false);
      }
    },
    [data, options]
  );

  return { data, isUpdating, update };
}
