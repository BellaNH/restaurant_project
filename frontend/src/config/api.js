// API Configuration
// Centralized API URL management using environment variables

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://restaurant-project-ek2l.onrender.com";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Export base URL for direct use
export default API_BASE_URL;








