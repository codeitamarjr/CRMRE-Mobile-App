import { Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";

interface UseAppwriteOptions<T, P extends Record<string, string | number | boolean>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
    initialData?: T | null;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams: P) => Promise<void>;
}

export const useApiQuery = <T, P extends Record<string, string | number | boolean>>({
    fn,
    params = {} as P,
    skip = false,
    initialData,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const hasInitialData = initialData !== undefined;
    const [data, setData] = useState<T | null>(hasInitialData ? (initialData as T | null) : null);
    const [loading, setLoading] = useState(!skip && !hasInitialData);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await fn(fetchParams);
                setData(result);
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "An unknown error occurred";
                setError(errorMessage);
                Alert.alert("Error", errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    useEffect(() => {
        if (!skip && !hasInitialData) {
            fetchData(params);
        }
    }, []);

    const refetch = async (newParams: P) => await fetchData(newParams);

    return { data, loading, error, refetch };
};
