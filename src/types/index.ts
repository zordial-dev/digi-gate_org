export interface Organisation {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  timezone?: string; // Added optional timezone
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  host_available_message: string;
  host_unavailable_message: string;
}

export interface Host {
  id: number;
  organisation_id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  designation: string;
  department: string;
  profile_pic: string;
  is_available: boolean;
  is_active: boolean;
  organisation?: Organisation; // Added optional organisation
}

export interface Visitor {
  id: number;
  organisation_id: number;
  full_name: string;
  designation: string;
  company: string;
  location?: string; // Made optional
  email?: string; // Made optional
  linkedin?: string; // Made optional
  mobile_number: string;
  created_at: string;
  updated_at?: string; // Added optional
  organisation?: Organisation; // Added optional
}

export interface VisitorVisit {
  id: number;
  visitor_id: number;
  organisation_id: number;
  host_id: number;
  purpose_of_visit: string;
  reference?: string; // Made optional
  selfie_url?: string; // Made optional
  otp_verified: boolean;
  visit_date: string;
  check_in_time: string;
  host_available_at_submission: boolean;
  confirmation_message?: string; // Made optional
  created_at: string;
  visitor?: Visitor;
  host?: Host;
  organisation?: Organisation; // Added optional
}

export interface DashboardStats {
  total_organisations: number;
  total_visitors: number;
  total_visits: number;
  active_organisations: number;
  today_visits?: number; // Added optional
  active_hosts?: number; // Added optional
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}