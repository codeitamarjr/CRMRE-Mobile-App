import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";

const DEFAULT_CRMRE_API_BASE_URL = "https://mdpm.realenquiries.com/api/v1/";
const DEFAULT_INCLUDES = [
  "attachments",
  "property",
  "property.attachments",
  "property.facilities",
  "property.client",
  "property.client.agents",
  "property.client.prs",
  "terms",
] as const;

type Nullable<T> = T | null | undefined;

interface AxiosErrorLike {
  isAxiosError: true;
  message: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

const isAxiosError = (error: unknown): error is AxiosErrorLike =>
  typeof error === "object" &&
  error !== null &&
  (error as Partial<AxiosErrorLike>).isAxiosError === true;

const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

const appendDefaultApiPath = (value: string) => {
  const trimmed = value.replace(/\/+$/, "");
  if (/\/api\/v\d+$/i.test(trimmed)) {
    return ensureTrailingSlash(trimmed);
  }

  return ensureTrailingSlash(`${trimmed}/api/v1`);
};

const resolveBaseUrl = (apiBaseUrl: string) => {
  try {
    const url = new URL(apiBaseUrl);
    url.pathname = url.pathname.replace(/\/api\/v\d+\/?$/, "/");
    return ensureTrailingSlash(url.toString());
  } catch {
    return ensureTrailingSlash(apiBaseUrl.replace(/\/api\/v\d+\/?$/, "/"));
  }
};

const resolveMediaUrl = (value: string | null | undefined, fallbackBase: string): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed === "#" ||
    trimmed === "http://#" ||
    trimmed === "https://#"
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).toString();
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  try {
    return new URL(trimmed.replace(/^\/*/, ""), fallbackBase).toString();
  } catch {
    return null;
  }
};

const MEDIA_URL_CANDIDATES = [
  "original_url",
  "originalUrl",
  "url",
  "full_url",
  "permalink",
  "href",
  "src",
  "source",
  "source_url",
  "path",
  "thumbnail",
  "preview_url",
];

const extractMediaUrl = (
  input: unknown,
  fallbackBase: string
): string | null => {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    return resolveMediaUrl(input, fallbackBase);
  }

  if (Array.isArray(input)) {
    for (const entry of input) {
      const url = extractMediaUrl(entry, fallbackBase);
      if (url) {
        return url;
      }
    }
    return null;
  }

  if (typeof input === "object") {
    const record = input as Record<string, unknown>;

    for (const key of MEDIA_URL_CANDIDATES) {
      const candidate = record[key];
      if (typeof candidate === "string") {
        const resolved = resolveMediaUrl(candidate, fallbackBase);
        if (resolved) {
          return resolved;
        }
      }
    }

    if (record.cover) {
      const resolved = extractMediaUrl(record.cover, fallbackBase);
      if (resolved) {
        return resolved;
      }
    }

    if (record.data) {
      const resolved = extractMediaUrl(record.data, fallbackBase);
      if (resolved) {
        return resolved;
      }
    }
  }

  return null;
};

const extractMediaUrls = (
  input: unknown,
  fallbackBase: string
): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input
      .map((entry) => extractMediaUrl(entry, fallbackBase))
      .filter((url): url is string => Boolean(url));
  }

  const single = extractMediaUrl(input, fallbackBase);
  return single ? [single] : [];
};

interface CRMRELinks {
  self?: string | null;
  apply?: string | null;
  cover?: string | null;
}

interface CRMREAgent {
  id?: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

interface CRMREFacility {
  identifier?: string | null;
  name?: string | null;
  description?: string | null;
}

interface CRMRELocation {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  country?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CRMRERate {
  price?: string | number | null;
  currency?: string | null;
  formatted?: string | null;
}

interface CRMREGallery {
  cover?: unknown;
  images?: unknown[];
}

interface CRMREPropertyDetails {
  code?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  facilities?: CRMREFacility[] | null;
  client?: {
    name?: string | null;
    agents?: CRMREAgent[] | null;
    prs?: CRMREAgent[] | null;
  } | null;
  gallery?: CRMREGallery | null;
}

interface CRMREUnit {
  id: number;
  unit_code?: string | null;
  number?: string | number | null;
  unit_number?: string | number | null;
  name?: string | null;
  type?: string | null;
  status?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sq_m?: string | number | null;
  date_available?: string | null;
  is_featured?: boolean | null;
  description?: string | null;
  location?: CRMRELocation | null;
  rate?: CRMRERate | null;
  gallery?: CRMREGallery | null;
  property?: CRMREPropertyDetails | null;
  links?: CRMRELinks | null;
  terms?: Array<{ title?: string | null; body?: string | null }> | null;
  views?: number | null;
}

export interface Agent {
  id?: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface Facility {
  identifier: string;
  facility: string;
  description?: string | null;
}

export interface Property {
  id: number;
  unitCode: string | null;
  number: string | null;
  name: string;
  type: string | null;
  status: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  dateAvailable: string | null;
  isFeatured: boolean;
  address: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  country: string;
  postcode?: string | null;
  description: string | null;
  rate: string;
  rateInfo: CRMRERate | null;
  gallery: {
    cover: string | null;
    images: string[];
  };
  property: {
    code?: string | null;
    name?: string | null;
    city?: string | null;
    country?: string | null;
    gallery?: {
      cover?: string | null;
    };
  } | null;
  facilities: Facility[];
  agents: Agent[];
  agent?: Agent | null;
  application_url: string | null;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  links: CRMRELinks;
  views?: number | null;
  raw: CRMREUnit;
}

const CRMRE_API_BASE_URL = (() => {
  const envValue = process.env.EXPO_PUBLIC_CRMRE_API_URL?.trim();

  if (!envValue) {
    console.warn(
      "[CRMRE] EXPO_PUBLIC_CRMRE_API_URL is not set; falling back to the default production URL."
    );
    return DEFAULT_CRMRE_API_BASE_URL;
  }

  try {
    // Validate the URL early to surface configuration issues during startup.
    return appendDefaultApiPath(new URL(envValue).toString());
  } catch (_error) {
    console.warn(
      `[CRMRE] Invalid EXPO_PUBLIC_CRMRE_API_URL provided ("${envValue}"); falling back to the default production URL.`
    );
    return DEFAULT_CRMRE_API_BASE_URL;
  }
})();

const CRMRE_APP_BASE_URL = resolveBaseUrl(CRMRE_API_BASE_URL);

const CRMRE_API_KEY = process.env.EXPO_PUBLIC_MOBILE_APP_API_KEY?.trim();

if (!CRMRE_API_KEY) {
  console.warn(
    "[CRMRE] No API key detected. Set EXPO_PUBLIC_MOBILE_APP_API_KEY to authenticate requests."
  );
}

const crmreClient = axios.create({
  baseURL: CRMRE_API_BASE_URL,
});

crmreClient.interceptors.request.use((config) => {
  if (CRMRE_API_KEY) {
    config.headers = {
      ...config.headers,
      "X-Api-Key": CRMRE_API_KEY,
    };
  }

  return config;
});

const mergeIncludes = (include?: string[] | string): string | undefined => {
  const includeSet = new Set<string>(
    include
      ? (Array.isArray(include) ? include : include.split(","))
          .map((item) => item.trim())
          .filter(Boolean)
      : []
  );

  DEFAULT_INCLUDES.forEach((item) => includeSet.add(item));

  if (!includeSet.size) {
    return undefined;
  }

  return Array.from(includeSet).join(",");
};

const parseNumber = (value: Nullable<string | number>): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatRate = (rate?: CRMRERate | null): string => {
  if (!rate) {
    return "Price on request";
  }

  if (rate.formatted) {
    return rate.formatted;
  }

  if (rate.price && rate.currency) {
    return `${rate.currency} ${rate.price}`;
  }

  if (rate.price) {
    return `${rate.price}`;
  }

  return "Price on request";
};

const buildFullAddress = (location?: CRMRELocation | null) => {
  const addressLine1 = location?.address_line_1 ?? null;
  const addressLine2 = location?.address_line_2 ?? null;
  const city = location?.city ?? "";
  const country = location?.country ?? "";
  const postcode = location?.postcode ?? null;

  const parts = [
    addressLine1,
    addressLine2,
    city,
    postcode,
    country,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return {
    full: parts.join(", "),
    addressLine1,
    addressLine2,
    city,
    country,
    postcode,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
  };
};

const mapFacility = (facility: CRMREFacility): Facility => ({
  identifier: facility.identifier ?? "info",
  facility: facility.name ?? facility.identifier ?? "Facility",
  description: facility.description ?? null,
});

const mapAgent = (agent: CRMREAgent): Agent => ({
  id: agent.id,
  name: agent.name ?? "Unknown Agent",
  email: agent.email ?? null,
  phone: agent.phone ?? null,
  avatar: agent.avatar_url ?? null,
});

const mapUnitToProperty = (unit: CRMREUnit): Property => {
  const {
    full,
    addressLine1,
    addressLine2,
    city,
    country,
    postcode,
    latitude,
    longitude,
  } = buildFullAddress(unit.location);

  const numberValue =
    unit.number ?? unit.unit_number ?? unit.unit_code ?? null;
  const numberAsString =
    numberValue !== null && numberValue !== undefined
      ? String(numberValue)
      : null;

  const facilities =
    unit.property?.facilities?.map(mapFacility).filter(Boolean) ?? [];

  const agents = unit.property?.client?.agents
    ?.map(mapAgent)
    .filter(Boolean) ?? [];

  const galleryCover =
    extractMediaUrl(unit.gallery?.cover, CRMRE_APP_BASE_URL) ??
    extractMediaUrl(unit.links?.cover, CRMRE_APP_BASE_URL);

  const galleryImages = extractMediaUrls(
    unit.gallery?.images,
    CRMRE_APP_BASE_URL
  );

  const propertyGalleryCover =
    extractMediaUrl(unit.property?.gallery?.cover, CRMRE_APP_BASE_URL) ??
    galleryCover ??
    null;

  const propertyGalleryImages = extractMediaUrls(
    unit.property?.gallery?.images,
    CRMRE_APP_BASE_URL
  );

  const combinedGalleryImages = Array.from(
    new Set(
      [...galleryImages, ...propertyGalleryImages].filter(
        (image): image is string => typeof image === "string" && image.length > 0
      )
    )
  );

  const galleryImagesWithCover = galleryCover
    ? [
        galleryCover,
        ...combinedGalleryImages.filter((image) => image !== galleryCover),
      ]
    : combinedGalleryImages;

  const computedAddress =
    full ||
    [
      unit.property?.name,
      unit.property?.city ?? city,
      unit.property?.country ?? country,
    ]
      .filter(Boolean)
      .join(", ");

  return {
    id: unit.id,
    unitCode: unit.unit_code ?? null,
    number: numberAsString,
    name:
      unit.name ??
      unit.property?.name ??
      unit.unit_code ??
      `Unit ${unit.id}`,
    type: unit.type ?? null,
    status: unit.status ?? null,
    bedrooms: unit.bedrooms ?? null,
    bathrooms: unit.bathrooms ?? null,
    area: parseNumber(unit.area_sq_m),
    dateAvailable: unit.date_available ?? null,
    isFeatured: Boolean(unit.is_featured),
    address: computedAddress,
    addressLine1,
    addressLine2,
    city: city || unit.property?.city || "",
    country: country || unit.property?.country || "",
    postcode,
    description: unit.description ?? null,
    rate: formatRate(unit.rate),
    rateInfo: unit.rate ?? null,
    gallery: {
      cover: galleryCover,
      images: galleryImagesWithCover,
    },
    property: unit.property
      ? {
          code: unit.property.code ?? null,
          name: unit.property.name ?? null,
          city: unit.property.city ?? null,
          country: unit.property.country ?? null,
          gallery: propertyGalleryCover
            ? {
                cover: propertyGalleryCover,
              }
            : undefined,
        }
      : null,
    facilities,
    agents,
    agent: agents[0] ?? null,
    application_url: unit.links?.apply ?? unit.links?.self ?? null,
    coordinates: {
      latitude,
      longitude,
    },
    links: unit.links ?? {},
    views: unit.views ?? null,
    raw: unit,
  };
};

interface CRMREListResponse {
  data: CRMREUnit[];
}

interface CRMRESingleResponse {
  data: CRMREUnit;
}

export interface GetPropertiesParams {
  id?: number;
  featured?: boolean;
  page?: number;
  query?: string;
  limit?: number;
  perPage?: number;
  include?: string[] | string;
  filters?: Record<string, string | number | boolean | undefined>;
}

export async function getProperties({
  id,
  featured,
  page = 1,
  query,
  limit,
  perPage,
  include,
  filters,
}: GetPropertiesParams): Promise<Property | Property[] | null> {
  try {
    const endpoint = id ? `units/${id}` : "units";

    const includeValue = mergeIncludes(include);
    const effectiveFilters: Record<string, string | number | boolean | undefined> =
      {
        ...(filters ?? {}),
      };

    if (!id && effectiveFilters.vacant === undefined) {
      effectiveFilters.vacant = true;
    }

    const filtersParams = Object.keys(effectiveFilters).length
      ? Object.fromEntries(
          Object.entries(effectiveFilters)
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => [
              `filters[${key}]`,
              typeof value === "boolean" ? (value ? "true" : "false") : value,
            ])
        )
      : {};

    const requestParams: Record<string, unknown> = {
      page,
      per_page: perPage ?? limit,
      include: includeValue,
      ...filtersParams,
    };

    if (typeof featured === "boolean") {
      requestParams.featured = featured ? "1" : "0";
    } else if (featured !== undefined) {
      requestParams.featured = featured;
    }

    if (query?.trim()) {
      requestParams.query = query.trim();
    }

    const response = await crmreClient.get<CRMREListResponse | CRMRESingleResponse>(endpoint, {
      params: requestParams,
    });

    const payload = response.data?.data;

    if (!payload) {
      if (id) {
        Alert.alert("No property found");
        return null;
      }

      return [];
    }

    if (Array.isArray(payload)) {
      return payload.map(mapUnitToProperty);
    }

    return mapUnitToProperty(payload);
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      console.error(
        "[CRMRE] API request failed",
        JSON.stringify(
          {
            status,
            data: responseData,
            message: error.message,
          },
          null,
          2
        )
      );
    } else {
      console.error("API Error:", error);
    }
    return null;
  }
}

interface UseCRMREOptions<T, P extends Record<string, unknown>> {
  fn: (params: P) => Promise<T | T[] | null>;
  params?: P;
  skip?: boolean;
  skipAlert?: boolean;
  customAlert?: (message: string) => void;
}

interface UseCRMREReturn<T, P extends Record<string, unknown>> {
  data: T | T[] | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams?: Partial<P>) => Promise<void>;
}

export const useCRMRE = <T, P extends Record<string, unknown>>({
  fn,
  params = {} as P,
  skip = false,
  skipAlert = false,
  customAlert,
}: UseCRMREOptions<T, P>): UseCRMREReturn<T, P> => {
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (overrideParams?: Partial<P>) => {
      setLoading(true);
      setError(null);

      const resolvedParams = {
        ...params,
        ...(overrideParams ?? {}),
      } as P;

      try {
        const result = await fn(resolvedParams);
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
    [fn, skipAlert, customAlert, params]
  );

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [fetchData, params, skip]);

  const refetch = async (newParams?: Partial<P>) => fetchData(newParams);

  return { data, loading, error, refetch };
};
