const API_BASE_URL = 'http://localhost:5001';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Dev-Mode': 'true', // Bypass authentication
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response;
};