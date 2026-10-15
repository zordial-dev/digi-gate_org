export interface Holiday {
  date: string;
  title: string;
}

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
  working_days?: string[];
  opening_time?: string;
  closing_time?: string;
  holidays?: Holiday[];
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
  is_available_toggle?: boolean;
  is_date_unavailable?: boolean;
  unavailable_dates?: string[];
  available_from?: string;
  available_to?: string;
  lunch_from?: string;
  lunch_to?: string;
  working_days?: string[];
  date_overrides?: Record<string, {
    type?: 'off' | 'custom';
    available_from?: string;
    available_to?: string;
    lunch_from?: string;
    lunch_to?: string;
    note?: string;
  }>;
  is_lunch?: boolean;
  is_on_leave?: boolean;
  is_off_duty?: boolean;
  availability_status?: string;
  status_label?: string;
  is_active: boolean;
  is_blocked?: boolean;
  password?: string;
  is_first_login?: boolean;
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

export interface OrganisationUserItem {
  id: number;
  organisation_id: number;
  email: string;
  role: 'super_admin' | 'admin' | 'sub_admin';
  is_active: boolean;
}

export interface Invitation {
  id: number;
  invitation_code: string;
  organisation_id: number;
  host_id: number;
  visitor_name: string;
  mobile_number: string;
  purpose_of_visit: string;
  valid_date: string;
  valid_until: string;
  additional_notes?: string | null;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  used_at?: string | null;
  visit_id?: number | null;
  created_at: string;
  updated_at: string;
  host?: {
    id: number;
    full_name: string;
    department?: string;
    designation?: string;
    profile_pic?: string;
  };
  organisation?: {
    id: number;
    name: string;
  };
  visit?: {
    id: number;
    check_in_time?: string;
    selfie_url?: string;
  };
}