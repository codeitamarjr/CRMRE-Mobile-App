import axios from 'axios';
import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";


export interface Property {
  id: number;
  address: string;
  city: string;
  country: string;
  description: string;
  rate: string;
  featured?: boolean;
  bathrooms: number;
  bedrooms: number;
  gallery: {
    cover: string;
    images: string[];
  };
  property:{
    name: string;
    address: string;
    city: string;
    country: string;
    gallery: {
      cover: string;
    };
  }
  facilities: {
    identifier: string;
    facility: string;
    description: string;
  };
  agent: {
    name: string;
    avatar: string;
    email: string;
    phone: string;
  };
  number: number;
  type: string;
  area: number;
  application_url: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  views?: number;
}

export async function getProperties({
  endpoint = 'units',
  id,
  featured,
  page = 1,
  query,
  limit,
}: {
  endpoint?: 'units' | `units/${number}`;
  id?: number;
  featured?: boolean;
  page?: number;
  query?: string;
  limit?: number;
}): Promise<Property[] | Property> {
  try {
    const url = `https://mdpm.realenquiries.com/api/v1/${endpoint}`;
    const response = await axios.get<{ data: Property | Record<string, Property> }>(url, {
      params: {
        id,
        featured: featured ? 1 : undefined,
        query,
        limit,
      },
    });

    if (!response.data || !response.data.data) {
      Alert.alert('No properties found');
      return [];
    }

    // Check if `data` is a single object or a record
    if ('id' in response.data.data) {
      // Single property
      return response.data.data as Property;
    }

    // Multiple properties
    return Object.values(response.data.data as Record<string, Property>);
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface UseCRMREOptions<T, P extends Record<string, string | number>> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
  skipAlert?: boolean;
  customAlert?: (message: string) => void;
}

interface UseCRMREReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams: P) => Promise<void>;
}

export const useCRMRE = <T, P extends Record<string, string | number>>({
  fn,
  params = {} as P,
  skip = false,
  skipAlert = false,
  customAlert,
}: UseCRMREOptions<T, P>): UseCRMREReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
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

        if (!skipAlert) {
          if (customAlert) {
            customAlert(errorMessage);
          } else {
            Alert.alert("Error", errorMessage);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [fn, skipAlert, customAlert]
  );

  useEffect(() => {
    if (!skip) {
      fetchData(params);
    }
  }, [fetchData, params, skip]);

  const refetch = async (newParams: P = params) => await fetchData(newParams);

  return { data, loading, error, refetch };
};

