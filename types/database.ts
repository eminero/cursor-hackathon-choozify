export type UserRole = 'tenant' | 'landlord' | 'admin';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contractor'
  | 'self_employed'
  | 'unemployed'
  | 'student'
  | 'retired'
  | 'other';

export type ApplicationStatus = 'submitted' | 'reviewing' | 'accepted' | 'rejected';

export type PropertyStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  income: number | null;
  score: number | null;
  employment_type: EmploymentType | null;
  preferences_json: {
    preferred_zone_names?: string[];
    has_pets?: boolean;
    smokes?: boolean;
    needs_parking?: boolean;
  };
  current_location_geom: any | null;
  created_at: string;
}

export interface PropertyDetails {
  price: number;
  bedrooms: number;
  has_parking: boolean;
  address: string;
}

export interface PropertyCriteria {
  min_income: number;
  min_score: number;
  employment_types_allowed: EmploymentType[] | 'any';
  pets_allowed: boolean;
  smoking_allowed: boolean;
}

export interface PropertyImage {
  url: string;
  path: string;
  alt: string;
  order?: number;
}

export interface Property {
  id: number;
  landlord_id: string;
  zone_name: string;
  details_json: PropertyDetails;
  criteria_json: PropertyCriteria;
  location_geom: any;
  images_json: PropertyImage[];
  status: PropertyStatus;
  created_at: string;
}

export interface Application {
  id: number;
  tenant_id: string;
  property_id: number;
  status: ApplicationStatus;
  visit_scheduled_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: number;
  user_id: string;
  message_history: ChatMessage[];
  created_at: string;
  updated_at: string;
}
