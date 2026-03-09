export interface MarketplaceUnitFacility {
  identifier: string;
  name: string;
  description?: string | null;
}

export interface MarketplaceUnitAgent {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface MarketplaceUnit {
  id: number;
  unit_code: string;
  number: string;
  name?: string | null;
  type?: string | null;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sq_m?: string | number | null;
  date_available?: string | null;
  location: {
    address_line_1?: string | null;
    address_line_2?: string | null;
    address_line_3?: string | null;
    city?: string | null;
    country?: string | null;
    postcode?: string | null;
  };
  rate?: {
    price?: string | number | null;
    currency?: string | null;
    formatted?: string | null;
  } | null;
  property?: {
    code: string;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    coordinates?: {
      latitude?: string | number | null;
      longitude?: string | number | null;
    } | null;
    description?: string | null;
    client?: {
      name?: string | null;
      agents?: MarketplaceUnitAgent[];
    };
    facilities?: MarketplaceUnitFacility[];
    gallery?: {
      cover?: string | null;
    };
  } | null;
  gallery?: {
    cover?: string | null;
    images?: string[];
  } | null;
  links?: {
    self?: string;
    apply?: string | null;
  };
}

export interface UnitListResponse {
  data: MarketplaceUnit[];
}

export interface UnitShowResponse {
  data: MarketplaceUnit;
}
