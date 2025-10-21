export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:5001');

// Store reference to forceLogout function
let forceLogoutCallback: (() => void) | null = null;

export const setAuthCallback = (callback: () => void) => {
  forceLogoutCallback = callback;
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication error detected, triggering logout');
      if (forceLogoutCallback) {
        forceLogoutCallback();
      }
      throw new Error('Authentication failed');
    }
    
    return response;
  } catch (error) {
    // Check if it's a network error and we have a token (potential expired token issue)
    if (error instanceof TypeError && error.message === 'Failed to fetch' && token) {
      console.log('Network error with stored token, clearing auth data');
      if (forceLogoutCallback) {
        forceLogoutCallback();
      }
    }
    throw error;
  }
};

// Helper function for authenticated requests
export const apiGet = async (endpoint: string) => {
  return apiRequest(endpoint, { method: 'GET' });
};

export const apiPost = async (endpoint: string, data?: any) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = async (endpoint: string, data?: any) => {
  return apiRequest(endpoint, {
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = async (endpoint: string) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};