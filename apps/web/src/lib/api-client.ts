import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!; // Ensure no trailing spaces!

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T,
  success: true,
  message: string
}

/** Decode JWT payload without verification; returns exp in ms, or null if invalid. */
function getAccessTokenExpiryMs(accessToken: string): number | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const decoded = JSON.parse(json) as { exp?: number };
    if (typeof decoded.exp !== 'number') return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

/** Get user-facing error message from backend or fallback. */
function getErrorMessage(error: AxiosError<{ message?: string }>): string {
  const msg = error.response?.data?.message || error.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (error.response?.status === 401) return 'Session expired. Please sign in again.';
  if (error.response?.status === 403) return 'You don\'t have permission to do this.';
  if (error.response?.status === 404) return 'The requested resource was not found.';
  if (error.response?.status && error.response.status >= 500) return 'Server error. Please try again later.';
  return error.message || 'Something went wrong.';
}

/** Show error toast from API error and rethrow so callers can still handle. */
function showErrorToast(error: AxiosError<{ message?: string }>): void {
  const message = getErrorMessage(error);
  toast.error(message);
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedRequestsQueue: Array<(token: string) => void> = [];
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly REFRESH_BEFORE_MS = 60 * 1000; // refresh 1 min before expiry

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  public setTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    this.startTokenRefreshTimer();
  }

  private clearTokens(): void {
    this.stopTokenRefreshTimer();
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /** Clear tokens and stop refresh timer (e.g. after logout). Call after signout API. */
  public clearAuth(): void {
    this.clearTokens();
  }

  /** Start proactive refresh timer; call after login or when tokens are restored. */
  public startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    const accessToken = this.getAccessToken();
    if (!accessToken) return;
    const expMs = getAccessTokenExpiryMs(accessToken);
    if (expMs == null) return;
    const now = Date.now();
    const refreshAt = expMs - this.REFRESH_BEFORE_MS;
    if (refreshAt <= now) {
      void this.refreshAccessToken().catch(() => {});
      return;
    }
    this.refreshTimerId = setTimeout(() => {
      this.refreshTimerId = null;
      void this.refreshAccessToken().catch(() => {});
    }, refreshAt - now);
  }

  /** Stop proactive refresh timer; call on logout. */
  public stopTokenRefreshTimer(): void {
    if (this.refreshTimerId != null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    const currentAccessToken = this.getAccessToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const res = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/token/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {}),
          },
        }
      );

      const { accessToken, refreshToken: newRefreshToken = refreshToken } = res.data;
      this.setTokens({ accessToken, refreshToken: newRefreshToken });
      return accessToken;
    } catch (error) {
      this.clearTokens();
      const msg = axios.isAxiosError(error) ? getErrorMessage(error) : 'Session expired. Please sign in again.';
      toast.error(msg);
      if (typeof window !== 'undefined') window.location.href = '/';
      throw error;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor: add auth header
    this.axiosInstance.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401 and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve) => {
              this.failedRequestsQueue.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;

            // Resolve queued requests
            this.failedRequestsQueue.forEach((callback) => callback(newToken));
            this.failedRequestsQueue = [];

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.failedRequestsQueue = [];
            if (axios.isAxiosError(refreshError)) showErrorToast(refreshError);
            return Promise.reject(refreshError);
          }
        }

        // For all other errors: show backend message in UI, then reject (no try-catch needed in callers)
        showErrorToast(error as AxiosError<{ message: string }>);
        return Promise.reject(error);
      }
    );
  }

  // Public API methods — fully typed
  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get<ApiResponse<T>>(url, config).then((res) => res.data?.data);
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post<ApiResponse<T>>(url, data, config).then((res) => res.data.data);
  }

  public async put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put<T>(url, data, config).then((res) => res.data);
  }

  public async patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch<ApiResponse<T>>(url, data, config).then((res) => res.data?.data);
  }

  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete<T>(url, config).then((res) => res.data);
  }
}

// Singleton instance
const apiClient = new ApiClient();


export default apiClient;