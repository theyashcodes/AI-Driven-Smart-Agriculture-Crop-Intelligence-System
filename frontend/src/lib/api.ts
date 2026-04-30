// Central API configuration for deployment flexibility
// Uses NEXT_PUBLIC_API_URL env var in production, falls back to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default API_BASE_URL;
