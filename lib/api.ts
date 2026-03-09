import { MarketplaceUnit, UnitListResponse, UnitShowResponse } from "@/types/marketplace";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const MOBILE_API_KEY = process.env.EXPO_PUBLIC_MOBILE_APP_API_KEY;
const DEFAULT_INCLUDES = "attachments,property,property.attachments";

type GetUnitsParams = {
  filter: string;
  query: string;
  limit?: number;
  page?: number;
  featured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  vacant?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

const buildUrl = (path: string, params?: URLSearchParams): string => {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
  }

  const query = params?.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
};

const getHeaders = (): HeadersInit => {
  if (!MOBILE_API_KEY) {
    throw new Error("EXPO_PUBLIC_MOBILE_APP_API_KEY is not configured");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Api-Key": MOBILE_API_KEY,
  };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    const fallbackMessage = `API request failed with status ${response.status}`;
    let message = fallbackMessage;

    try {
      const payload = await response.json();
      message = payload?.message ?? fallbackMessage;
    } catch {}

    throw new Error(message);
  }

  return (await response.json()) as T;
};

const matchesQuery = (unit: MarketplaceUnit, query: string): boolean => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const terms = [
    unit.name,
    unit.type,
    unit.location?.address_line_1,
    unit.location?.city,
    unit.location?.postcode,
    unit.property?.name,
    unit.property?.address,
  ];

  return terms
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalized));
};

const matchesPriceRange = (unit: MarketplaceUnit, minPrice?: number, maxPrice?: number): boolean => {
  if (minPrice === undefined && maxPrice === undefined) {
    return true;
  }

  const numericPrice = Number(unit.rate?.price);

  if (Number.isNaN(numericPrice)) {
    return false;
  }

  if (minPrice !== undefined && numericPrice < minPrice) {
    return false;
  }

  if (maxPrice !== undefined && numericPrice > maxPrice) {
    return false;
  }

  return true;
};

const fetchUnits = async ({
  filter,
  query,
  limit = 20,
  page = 1,
  featured,
  bedrooms,
  bathrooms,
  vacant,
  minPrice,
  maxPrice,
}: GetUnitsParams): Promise<MarketplaceUnit[]> => {
  const params = new URLSearchParams();
  params.set("per_page", String(limit));
  params.set("page", String(page));
  params.set("include", DEFAULT_INCLUDES);

  if (featured !== undefined) {
    params.set("featured", featured ? "1" : "0");
  }

  if (bedrooms !== undefined) {
    params.set("filters[bedrooms]", String(bedrooms));
  }

  if (bathrooms !== undefined) {
    params.set("filters[bathrooms]", String(bathrooms));
  }

  if (vacant !== undefined) {
    params.set("filters[vacant]", vacant ? "1" : "0");
  }

  if (filter && filter !== "All") {
    params.set("filters[type]", filter);
  }

  const url = buildUrl("/units", params);
  const payload = await fetchJson<UnitListResponse>(url);

  return payload.data.filter((unit) => matchesQuery(unit, query) && matchesPriceRange(unit, minPrice, maxPrice));
};

export async function getLatestProperties(_: Record<string, never> = {}): Promise<MarketplaceUnit[]> {
  const featuredUnits = await fetchUnits({
    filter: "All",
    query: "",
    limit: 5,
    featured: true,
  });

  if (featuredUnits.length > 0) {
    return featuredUnits;
  }

  return fetchUnits({
    filter: "All",
    query: "",
    limit: 5,
  });
}

export async function getProperties({
  filter,
  query,
  limit,
  page,
  bedrooms,
  bathrooms,
  vacant,
  minPrice,
  maxPrice,
}: {
  filter: string;
  query: string;
  limit?: number;
  page?: number;
  bedrooms?: number;
  bathrooms?: number;
  vacant?: boolean;
  minPrice?: number;
  maxPrice?: number;
}): Promise<MarketplaceUnit[]> {
  return fetchUnits({
    filter: filter || "All",
    query: query || "",
    limit,
    page,
    bedrooms,
    bathrooms,
    vacant,
    minPrice,
    maxPrice,
  });
}

export async function getPropertyById({ id }: { id: string }): Promise<MarketplaceUnit | null> {
  if (!id) {
    return null;
  }

  const params = new URLSearchParams();
  params.set(
    "include",
    "attachments,property,property.attachments,property.facilities,property.client,property.client.agents,property.client.prs,terms"
  );

  const url = buildUrl(`/units/${id}`, params);
  const payload = await fetchJson<UnitShowResponse>(url);

  return payload.data;
}
