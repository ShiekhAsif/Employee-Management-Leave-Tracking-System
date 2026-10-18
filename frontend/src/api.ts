import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string; errors?: Record<string, string> } | undefined;
    if (body?.message) return body.message;
    if (body?.errors) return Object.values(body.errors).join(' ');
    if (!error.response) return 'Could not connect to the backend. Check that Spring Boot is running on port 8080.';
  }
  return 'Something went wrong. Please try again.';
}
