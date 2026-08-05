"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api, getAuthToken, setAuthToken, removeAuthToken, type User, type Company, type Aircraft, type Country } from "./api";
import { ROLE_BASE } from "./nav";

export type UserRole = "admin" | "underwriter" | "operator";

interface AppState {
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;

  // Companies
  companies: Company[];
  // Countries
  countries: Country[];
  // Aircraft
  aircraft: Aircraft[];
  loading: {
    users: boolean;
    companies: boolean;
    countries: boolean;
    aircraft: boolean;
    userCreate: boolean;
    userUpdate: boolean;
    userDelete: boolean;
    passwordChange: boolean;
    auth: boolean;
  };

  // Users management
  users: User[];

  // Actions - Auth
  login: (email: string, password: string) => Promise<{ user: User; redirect: string }>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;

  // Actions - Countries
  fetchCountries: () => Promise<void>;

  // Actions - Companies
  fetchCompanies: () => Promise<void>;
  createCompany: (data: { name: string; type: "INSURER_OPS" | "OPERATOR"; country: string }) => Promise<Company>;
  updateCompany: (companyId: string, data: { name?: string; type?: "INSURER_OPS" | "OPERATOR"; country?: string }) => Promise<Company>;
  deleteCompany: (companyId: string) => Promise<void>;

  // Actions - Aircraft
  fetchAircraft: (companyId?: string) => Promise<void>;
  createAircraft: (data: {
    registration: string;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    year?: number;
    status?: string;
    companyId: string;
  }) => Promise<Aircraft>;
  updateAircraft: (aircraftId: string, data: {
    registration?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    year?: number;
    status?: string;
  }) => Promise<Aircraft>;
  deleteAircraft: (aircraftId: string) => Promise<void>;

  // Actions - Users
  fetchUsers: (params?: { role?: string; status?: string }) => Promise<void>;
  createUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    companyId?: string;
  }) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<User>;
  changeUserPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resendInvitation: (userId: string) => Promise<void>;

  // Helpers
  getRedirectPath: (role: UserRole) => string;
}

// Check if JWT token is expired (client-side check)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If we can't parse, treat as expired
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      companies: [],
      countries: [],
      aircraft: [],
      users: [],
      loading: {
        users: false,
        companies: false,
        countries: false,
        aircraft: false,
        userCreate: false,
        userUpdate: false,
        userDelete: false,
        passwordChange: false,
        auth: false,
      },

      // Auth Actions
      login: async (email: string, password: string) => {
        set(state => ({ loading: { ...state.loading, auth: true } }));
        try {
          const response = await api.auth.login(email, password);
          const user = response.user;

          set({
            currentUser: user,
            isAuthenticated: true,
          });

          return { user, redirect: ROLE_BASE[user.role] };
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, auth: false } }));
        }
      },

      logout: async () => {
        // Call API logout (this will also clear the token)
        await api.auth.logout();

        set({
          currentUser: null,
          isAuthenticated: false,
          users: [],
        });
      },

      fetchCurrentUser: async () => {
        const token = getAuthToken();
        if (!token) {
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // Check token expiry before making request
        if (isTokenExpired(token)) {
          removeAuthToken();
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        set(state => ({ loading: { ...state.loading, auth: true } }));
        try {
          const user = await api.auth.me();
          set({
            currentUser: user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          // Only clear auth on actual 401, not network errors
          if (error instanceof Error && error.message.includes("401")) {
            removeAuthToken();
            set({ currentUser: null, isAuthenticated: false });
          }
        } finally {
          set(state => ({ loading: { ...state.loading, auth: false } }));
        }
      },

      initializeAuth: async () => {
        const token = getAuthToken();
        const { isAuthenticated, currentUser } = get();
        
        // If no token, clear auth
        if (!token) {
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // If token expired, clear and don't try to validate
        if (isTokenExpired(token)) {
          removeAuthToken();
          set({ currentUser: null, isAuthenticated: false });
          return;
        }

        // If we already have authenticated user from persist, trust it (don't re-validate on every refresh)
        if (isAuthenticated && currentUser) {
          return;
        }

        // Only fetch if we have token but no persisted user (first load)
        await get().fetchCurrentUser();
      },

      // Companies Actions
      fetchCompanies: async () => {
        set(state => ({ loading: { ...state.loading, companies: true } }));
        try {
          const companies = await api.companies.list();
          set({ companies });
        } catch (error) {
          console.error("Failed to fetch companies:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, companies: false } }));
        }
      },

      fetchCountries: async () => {
        set(state => ({ loading: { ...state.loading, countries: true } }));
        try {
          const countries = await api.countries.list();
          set({ countries });
        } catch (error) {
          console.error("Failed to fetch countries:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, countries: false } }));
        }
      },

      createCompany: async (data) => {
        set(state => ({ loading: { ...state.loading, companies: true } }));
        try {
          const newCompany = await api.companies.create(data);
          set(state => ({ companies: [newCompany, ...state.companies] }));
          return newCompany;
        } catch (error) {
          console.error("Failed to create company:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, companies: false } }));
        }
      },

      updateCompany: async (companyId, data) => {
        set(state => ({ loading: { ...state.loading, companies: true } }));
        try {
          const updatedCompany = await api.companies.update(companyId, data);
          set(state => ({
            companies: state.companies.map(c => c.id === companyId ? updatedCompany : c),
          }));
          return updatedCompany;
        } catch (error) {
          console.error("Failed to update company:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, companies: false } }));
        }
      },

      deleteCompany: async (companyId) => {
        set(state => ({ loading: { ...state.loading, companies: true } }));
        try {
          await api.companies.delete(companyId);
          set(state => ({
            companies: state.companies.filter(c => c.id !== companyId),
          }));
        } catch (error) {
          console.error("Failed to delete company:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, companies: false } }));
        }
      },

      // Aircraft Actions
      fetchAircraft: async (companyId?: string) => {
        set(state => ({ loading: { ...state.loading, aircraft: true } }));
        try {
          const aircraft = await api.aircraft.list(companyId);
          set({ aircraft });
        } catch (error) {
          console.error("Failed to fetch aircraft:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, aircraft: false } }));
        }
      },

      createAircraft: async (data) => {
        set(state => ({ loading: { ...state.loading, aircraft: true } }));
        try {
          const newAircraft = await api.aircraft.create(data);
          set(state => ({ aircraft: [newAircraft, ...state.aircraft] }));
          return newAircraft;
        } catch (error) {
          console.error("Failed to create aircraft:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, aircraft: false } }));
        }
      },

      updateAircraft: async (aircraftId, data) => {
        set(state => ({ loading: { ...state.loading, aircraft: true } }));
        try {
          const updatedAircraft = await api.aircraft.update(aircraftId, data);
          set(state => ({
            aircraft: state.aircraft.map(a => a.id === aircraftId ? updatedAircraft : a),
          }));
          return updatedAircraft;
        } catch (error) {
          console.error("Failed to update aircraft:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, aircraft: false } }));
        }
      },

      deleteAircraft: async (aircraftId) => {
        set(state => ({ loading: { ...state.loading, aircraft: true } }));
        try {
          await api.aircraft.delete(aircraftId);
          set(state => ({
            aircraft: state.aircraft.filter(a => a.id !== aircraftId),
          }));
        } catch (error) {
          console.error("Failed to delete aircraft:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, aircraft: false } }));
        }
      },

      // Users Actions
      fetchUsers: async (params?: { role?: string; status?: string }) => {
        set(state => ({ loading: { ...state.loading, users: true } }));
        try {
          const users = await api.users.list(params);
          set({ users });
        } catch (error) {
          console.error("Failed to fetch users:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, users: false } }));
        }
      },

      createUser: async (userData) => {
        set(state => ({ loading: { ...state.loading, userCreate: true } }));
        try {
          const newUser = await api.users.create(userData);
          // Fetch the full user with company relation
          const fullUser = await api.users.get(newUser.id);
          set(state => ({ users: [fullUser, ...state.users] }));
          return fullUser;
        } catch (error) {
          console.error("Failed to create user:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, userCreate: false } }));
        }
      },

      updateUser: async (userId: string, updates: Partial<User>) => {
        set(state => ({ loading: { ...state.loading, userUpdate: true } }));
        try {
          const updatedUser = await api.users.update(userId, updates);
          set(state => ({
            users: state.users.map(user =>
              user.id === userId ? updatedUser : user
            ),
            currentUser:
              state.currentUser?.id === userId
                ? updatedUser
                : state.currentUser,
          }));
          return updatedUser;
        } catch (error) {
          console.error("Failed to update user:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, userUpdate: false } }));
        }
      },

      changeUserPassword: async (userId: string, currentPassword: string, newPassword: string) => {
        set(state => ({ loading: { ...state.loading, passwordChange: true } }));
        try {
          await api.users.changePassword(userId, currentPassword, newPassword);
        } catch (error) {
          console.error("Failed to change password:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, passwordChange: false } }));
        }
      },

      deleteUser: async (userId: string) => {
        set(state => ({ loading: { ...state.loading, userDelete: true } }));
        try {
          await api.users.delete(userId);
          set(state => ({
            users: state.users.filter(user => user.id !== userId),
          }));
        } catch (error) {
          console.error("Failed to delete user:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, userDelete: false } }));
        }
      },

      resendInvitation: async (userId: string) => {
        set(state => ({ loading: { ...state.loading, userUpdate: true } }));
        try {
          await api.auth.resendInvitation(userId);
        } catch (error) {
          console.error("Failed to resend invitation:", error);
          throw error;
        } finally {
          set(state => ({ loading: { ...state.loading, userUpdate: false } }));
        }
      },

      // Helpers
      getRedirectPath: (role: UserRole) => {
        return ROLE_BASE[role] || "/dashboard";
      },
    }),
    {
      name: "fred-black-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist auth state and token
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate correctly
      onRehydrateStorage: () => (state) => {
        // State is automatically rehydrated by zustand persist
      },
    }
  )
);

// Export a hook for easy access to clientApi (for components that need direct API calls)
export const clientApi = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};

// Re-export apiRequest for internal use
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    removeAuthToken();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}