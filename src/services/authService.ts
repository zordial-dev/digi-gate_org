import apiClient from '../api/client';

export interface User {
  id: number | string;
  fullName?: string;
  full_name?: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  organisation_id?: number | null;
  organisationName?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
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
      role: user.role || 'Organisation Admin',
      organisation_id: user.organisation_id,
      organisationName: user.organisation_name || 'Organisation',
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
      role: user.role || 'Organisation Admin',
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
};
