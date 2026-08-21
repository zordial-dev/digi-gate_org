import apiClient from './client';
import type { 
  Organisation, 
  Host, 
  Visitor, 
  VisitorVisit, 
  DashboardStats,
  ApiResponse 
} from '@/types';

// ============================================================
// Organisation API
// ============================================================
export const organisationApi = {
  // Get organisation by ID
  getById: (id: number) =>
    apiClient.get<ApiResponse<Organisation>>(`/organisations/${id}`),
  
  // Update organisation (with file upload support)
  update: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<Organisation>>(`/organisations/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Get organisation settings
  getSettings: (id: number) =>
    apiClient.get<ApiResponse<{ 
      host_available_message: string; 
      host_unavailable_message: string 
    }>>(`/organisations/${id}/settings`),
  
  // Update organisation settings
  updateSettings: (id: number, data: { 
    host_available_message?: string; 
    host_unavailable_message?: string 
  }) =>
    apiClient.put<ApiResponse<Organisation>>(`/organisations/${id}/settings`, data),
};

// ============================================================
// Host API
// ============================================================
export const hostApi = {
  getAll: (organisationId: number, params?: { is_active?: boolean }) =>
    apiClient.get<ApiResponse<Host[]>>(`/organisations/${organisationId}/hosts`, { params }),
  
  getById: (id: number) =>
    apiClient.get<ApiResponse<Host>>(`/hosts/${id}`),
  
  create: (data: Partial<Host>) =>
    apiClient.post<ApiResponse<Host>>('/hosts', data),
  
  // Add these two methods for file upload
  createWithFile: (data: FormData) =>
    apiClient.post<ApiResponse<Host>>('/hosts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateWithFile: (id: number, data: FormData) =>
    apiClient.put<ApiResponse<Host>>(`/hosts/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: number, data: Partial<Host>) =>
    apiClient.put<ApiResponse<Host>>(`/hosts/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/hosts/${id}`),
  
  toggleAvailability: (id: number) =>
    apiClient.patch<ApiResponse<Host>>(`/hosts/${id}/toggle-availability`),
  
  updateUnavailableDates: (id: number, unavailable_dates: string[]) =>
    apiClient.patch<ApiResponse<Host>>(`/hosts/${id}/unavailable-dates`, { unavailable_dates }),
};

// ============================================================
// Visitor API
// ============================================================
export const visitorApi = {
  // Get all visitors for an organisation
  getAll: (organisationId: number, params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) =>
    apiClient.get<ApiResponse<Visitor[]>>(`/organisations/${organisationId}/visitors`, { params }),
  
  // Get visitor by ID
  getById: (id: number) =>
    apiClient.get<ApiResponse<Visitor>>(`/visitors/${id}`),
  
  // Get visitor by mobile number
  getByMobile: (mobile: string) =>
    apiClient.get<ApiResponse<Visitor>>(`/visitors/mobile/${mobile}`),
  
  // Get visitor visit history
  getHistory: (id: number) =>
    apiClient.get<ApiResponse<VisitorVisit[]>>(`/visitors/${id}/history`),
};

// ============================================================
// Visit API
// ============================================================
export const visitApi = {
  // Get all visits for an organisation
  getAll: (organisationId: number, params?: { 
    page?: number; 
    limit?: number; 
    startDate?: string; 
    endDate?: string;
    hostId?: number;
    visitorId?: number;
  }) =>
    apiClient.get<ApiResponse<VisitorVisit[]>>(`/organisations/${organisationId}/visits`, { params }),
  
  // Get visit by ID
  getById: (id: number) =>
    apiClient.get<ApiResponse<VisitorVisit>>(`/visits/${id}`),
  
  // Get visits by date range
  getByDateRange: (organisationId: number, startDate: string, endDate: string) =>
    apiClient.get<ApiResponse<VisitorVisit[]>>(
      `/organisations/${organisationId}/visits?startDate=${startDate}&endDate=${endDate}`
    ),
  
  // Get today's visits
  getToday: (organisationId: number) =>
    apiClient.get<ApiResponse<VisitorVisit[]>>(`/organisations/${organisationId}/visits/today`),
};

// ============================================================
// Dashboard API
// ============================================================
export const dashboardApi = {
  // Get dashboard statistics
  getStats: (organisationId: number) =>
    apiClient.get<ApiResponse<DashboardStats>>(`/organisations/${organisationId}/dashboard/stats`),
  
  // Get recent visits for dashboard
  getRecentVisits: (organisationId: number, limit: number = 5) =>
    apiClient.get<ApiResponse<VisitorVisit[]>>(
      `/organisations/${organisationId}/dashboard/recent?limit=${limit}`
    ),
  
  // Get visitor statistics (chart data)
  getVisitorStats: (organisationId: number, days: number = 7) =>
    apiClient.get<ApiResponse<{ date: string; count: number }[]>>(
      `/organisations/${organisationId}/dashboard/visitor-stats?days=${days}`
    ),
};

// ============================================================
// Reports API
// ============================================================
export const reportsApi = {
  // Generate visit report
  generateVisitReport: (organisationId: number, params: {
    startDate: string;
    endDate: string;
    format?: 'csv' | 'excel' | 'pdf';
  }) =>
    apiClient.post<ApiResponse<{ url: string }>>(
      `/organisations/${organisationId}/reports/visits`,
      params
    ),
  
  // Download report
  downloadReport: (reportId: string) =>
    apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    }),
};

// ============================================================
// Export all APIs
// ============================================================
export default {
  organisationApi,
  hostApi,
  visitorApi,
  visitApi,
  dashboardApi,
  reportsApi,
};