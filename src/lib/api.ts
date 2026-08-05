// API client for backend communication
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("fb_access_token");
  }
  return null;
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fb_access_token");
  }
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("fb_access_token", token);
  }
};

// Company interface
export interface Company {
  id: string;
  name: string;
  type: "INSURER_OPS" | "OPERATOR";
  country: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    aircraft: number;
  };
  users?: User[];
  aircraft?: Aircraft[];
}

// Country interface
export interface Country {
  id: string;
  code: string;
  name: string;
  flagPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Aircraft interface
export interface Aircraft {
  id: string;
  registration: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  year?: number;
  status: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "underwriter" | "operator";
  roleLabel: string;
  company: Company;
  status: "active" | "invited" | "suspended";
  lastActive: string | null;
  createdAt: string;
  updatedAt: string;
}

// Generic API request function
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401) {
      removeAuthToken();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as Promise<T>;
  } catch (error) {
    console.error(`API Error [${config.method || "GET"} ${url}]:`, error);
    throw error;
  }
};

// API client object
export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiRequest<{
        accessToken: string;
        user: User;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.accessToken) {
        setAuthToken(response.accessToken);
      }

      return response;
    },

    register: async (data: {
      email: string;
      name: string;
      password: string;
      role: "admin" | "underwriter" | "operator";
      roleLabel?: string;
      companyId: string;
    }) => {
      const response = await apiRequest<{
        accessToken: string;
        user: User;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.accessToken) {
        setAuthToken(response.accessToken);
      }

      return response;
    },

    logout: async () => {
      try {
        await apiRequest("/api/auth/logout", { method: "POST" });
      } catch (error) {
        console.log("Logout API call failed, but continuing with local cleanup");
      } finally {
        removeAuthToken();
      }
    },

    me: async () => {
      return apiRequest<User>("/api/auth/me");
    },

    resendInvitation: async (userId: string) => {
      return apiRequest<{ message: string }>(`/api/auth/resend-invitation/${userId}`, {
        method: "POST",
      });
    },

    acceptInvitation: async (token: string) => {
      return apiRequest<{ message: string }>(`/api/auth/accept-invitation?token=${encodeURIComponent(token)}`);
    },
  },

  // Countries
  countries: {
    list: async () => {
      return apiRequest<Country[]>("/api/countries");
    },

    get: async (countryId: string) => {
      return apiRequest<Country>(`/api/countries/${countryId}`);
    },

    getByCode: async (code: string) => {
      return apiRequest<Country>(`/api/countries/code/${code}`);
    },
  },

  // Companies
  companies: {
    list: async () => {
      return apiRequest<Company[]>("/api/companies");
    },

    get: async (companyId: string) => {
      return apiRequest<Company>(`/api/companies/${companyId}`);
    },

    create: async (data: { name: string; type: "INSURER_OPS" | "OPERATOR"; country: string }) => {
      return apiRequest<Company>("/api/companies", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: async (companyId: string, data: { name?: string; type?: "INSURER_OPS" | "OPERATOR"; country?: string }) => {
      return apiRequest<Company>(`/api/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    delete: async (companyId: string) => {
      return apiRequest<void>(`/api/companies/${companyId}`, {
        method: "DELETE",
      });
    },
  },

  // Aircraft
  aircraft: {
    list: async (companyId?: string) => {
      const query = companyId ? `?companyId=${companyId}` : "";
      return apiRequest<Aircraft[]>(`/api/aircraft${query}`);
    },

    get: async (aircraftId: string) => {
      return apiRequest<Aircraft>(`/api/aircraft/${aircraftId}`);
    },

    create: async (data: {
      registration: string;
      manufacturer: string;
      model: string;
      serialNumber?: string;
      year?: number;
      status?: string;
      companyId: string;
    }) => {
      return apiRequest<Aircraft>("/api/aircraft", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: async (aircraftId: string, data: {
      registration?: string;
      manufacturer?: string;
      model?: string;
      serialNumber?: string;
      year?: number;
      status?: string;
    }) => {
      return apiRequest<Aircraft>(`/api/aircraft/${aircraftId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    delete: async (aircraftId: string) => {
      return apiRequest<void>(`/api/aircraft/${aircraftId}`, {
        method: "DELETE",
      });
    },
  },

  // Users management
  users: {
    // Get all users
    list: async (params?: { role?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.role) query.append("role", params.role);
      if (params?.status) query.append("status", params.status);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return apiRequest<User[]>(`/api/users${queryString}`);
    },

    // Get single user by ID
    get: async (userId: string) => {
      return apiRequest<User>(`/api/users/${userId}`);
    },

    // Create new user (invite)
    create: async (userData: {
      name: string;
      email: string;
      password: string;
      role: "admin" | "underwriter" | "operator";
      companyId?: string;
    }) => {
      const response = await apiRequest<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response.user;
    },

    // Update user
    update: async (
      userId: string,
      updates: Partial<{
        name: string;
        email: string;
        role: "admin" | "underwriter" | "operator";
        roleLabel: string;
        companyId: string;
        status: "active" | "invited" | "suspended";
      }>
    ) => {
      return apiRequest<User>(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },

    // Change password
    changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
      return apiRequest<{ id: string }>(`/api/users/${userId}/password`, {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    // Delete user
    delete: async (userId: string) => {
      return apiRequest<void>(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
  },
};

// Export utility functions
export { getAuthToken, setAuthToken, removeAuthToken };

// Default export
export default api;