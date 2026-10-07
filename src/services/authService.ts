import apiClient from '../api/client';

export interface User {
  id: number | string;
  fullName?: string;
  full_name?: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  org_user_role?: 'super_admin' | 'admin' | 'sub_admin' | string;
  organisation_id?: number | null;
  organisationName?: string;
  avatar?: string;
  is_active?: boolean;
  is_approved?: number;
  block_reason?: string | null;
  department?: string;
  designation?: string;
  mobile_number?: string;
  is_first_login?: boolean;
  is_blocked?: boolean;
  organisation?: {
    id: number;
    name: string;
    code?: string;
    is_active: boolean;
    is_approved: number;
    block_reason?: string | null;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    logo_url?: string;
  } | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface HostLoginCredentials {
  identifier: string; // Host ID or Email
  password?: string;
  rememberMe?: boolean;
}

export interface HostLoginResult {
  requiresNewPassword?: boolean;
  host?: {
    id: number | string;
    full_name: string;
    email: string;
    organisation_id?: number;
    organisation_name?: string;
  };
  user?: User;
}

export interface HostSetPasswordPayload {
  hostId?: number | string;
  identifier?: string;
  email?: string;
  new_password: string;
  confirm_password?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  username?: string;
  phone: string;
  password?: string;
  role?: string;
  organisationName?: string;
  organisationCode?: string;
}

const TOKEN_KEY = 'digi_gate_token';
const USER_KEY = 'digi_gate_org_user';

export const authService = {
  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.success && response.data.user) {
        const u = response.data.user;
        const mappedUser: User = {
          id: u.id,
          fullName: u.full_name || u.username,
          full_name: u.full_name,
          email: u.email,
          username: u.username,
          role: u.org_user_role || u.role || 'admin',
          org_user_role: u.org_user_role || u.role || 'admin',
          organisation_id: u.organisation_id,
          organisationName: u.organisation_name || u.organisation?.name || 'Organisation',
          is_active: u.is_active ?? u.organisation?.is_active ?? false,
          is_approved: u.is_approved ?? u.organisation?.is_approved ?? 0,
          block_reason: u.block_reason || u.organisation?.block_reason || null,
          organisation: u.organisation || null,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
        return mappedUser;
      }
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
    return null;
  },

  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Login failed.');
    }

    const { token, user } = response.data;
    const mappedUser: User = {
      id: user.id,
      fullName: user.full_name || user.username,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: user.org_user_role || user.role || 'admin',
      org_user_role: user.org_user_role || user.role || 'admin',
      organisation_id: user.organisation_id,
      organisationName: user.organisation_name || user.organisation?.name || 'Organisation',
      is_active: user.is_active ?? user.organisation?.is_active ?? false,
      is_approved: user.is_approved ?? user.organisation?.is_approved ?? 0,
      block_reason: user.block_reason || user.organisation?.block_reason || null,
      organisation: user.organisation || null,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    };

    if (credentials.rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
    }

    return mappedUser;
  },

  hostLogin: async (credentials: HostLoginCredentials): Promise<HostLoginResult> => {
    const response = await apiClient.post('/auth/host-login', {
      identifier: credentials.identifier,
      password: credentials.password,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Host login failed.');
    }

    if (response.data.requiresNewPassword) {
      return {
        requiresNewPassword: true,
        host: response.data.host
      };
    }

    const { token, user } = response.data;
    const mappedUser: User = {
      id: user.id,
      fullName: user.full_name || user.username,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: 'host',
      org_user_role: 'host',
      organisation_id: user.organisation_id,
      organisationName: user.organisation_name || user.organisation?.name || 'Organisation',
      is_active: true,
      is_approved: 1,
      is_blocked: user.is_blocked || false,
      is_first_login: user.is_first_login || false,
      department: user.department,
      designation: user.designation,
      mobile_number: user.mobile_number,
      organisation: user.organisation || null,
      avatar: user.profile_pic ? `${apiClient.defaults.baseURL?.replace('/api', '') || ''}${user.profile_pic}` : undefined
    };

    if (credentials.rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
    }

    return { user: mappedUser };
  },

  setHostNewPassword: async (payload: HostSetPasswordPayload): Promise<User> => {
    const response = await apiClient.post('/auth/host/set-password', payload);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to set password.');
    }

    const { token, user } = response.data;
    const mappedUser: User = {
      id: user.id,
      fullName: user.full_name || user.username,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: 'host',
      org_user_role: 'host',
      organisation_id: user.organisation_id,
      organisationName: user.organisation_name || user.organisation?.name || 'Organisation',
      is_active: true,
      is_approved: 1,
      is_blocked: user.is_blocked || false,
      is_first_login: false,
      department: user.department,
      designation: user.designation,
      mobile_number: user.mobile_number,
      organisation: user.organisation || null,
      avatar: user.profile_pic ? `${apiClient.defaults.baseURL?.replace('/api', '') || ''}${user.profile_pic}` : undefined
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));

    return mappedUser;
  },

  register: async (data: RegisterCredentials): Promise<{ requiresOtp: boolean; email: string; devOtp?: string }> => {
    const response = await apiClient.post('/auth/signup', {
      full_name: data.fullName,
      email: data.email,
      username: data.username || data.email,
      phone: data.phone,
      password: data.password,
      role: 'organisation',
      organisation_name: data.organisationName,
      organisation_code: data.organisationCode
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Registration failed.');
    }

    return {
      requiresOtp: true,
      email: response.data.email || data.email,
      devOtp: response.data.devOtp
    };
  },

  verifyOtp: async (email: string, otp: string): Promise<{ requiresApproval: boolean; user: User | null }> => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });

    if (!response.data.success) {
      throw new Error(response.data.error || 'OTP verification failed.');
    }

    const { token, user, requiresApproval } = response.data;

    if (requiresApproval) {
      return { requiresApproval: true, user: null };
    }

    const mappedUser: User = {
      id: user.id,
      fullName: user.full_name || user.username,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: user.org_user_role || user.role || 'admin',
      org_user_role: user.org_user_role || user.role || 'admin',
      organisation_id: user.organisation_id,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    };

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
    }

    return { requiresApproval: false, user: mappedUser };
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; email: string; devOtp?: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to request password reset.');
    }

    return {
      success: true,
      email: response.data.email || email,
      devOtp: response.data.devOtp
    };
  },

  resetPassword: async (email: string, otp: string, newPassword?: string): Promise<boolean> => {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      new_password: newPassword
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Password reset failed.');
    }

    return true;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to change password.');
    }

    return true;
  },
};
