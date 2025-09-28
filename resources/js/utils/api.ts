// @/utils/api.ts

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

const isAbsoluteUrl = (u: string) => /^https?:\/\//i.test(u);

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  private getCSRFToken(): string | null {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const csrfToken = this.getCSRFToken();

      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      };

      const mergedHeaders: HeadersInit = {
        ...defaultHeaders,
        ...(options.headers || {}),
      };

      // If caller passed an absolute URL, do NOT prefix with baseURL
      const url = isAbsoluteUrl(endpoint) ? endpoint : `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        // cookies/session must always be sent, even for absolute URLs
        credentials: 'include',
        // method/body/headers from caller override defaults
        ...options,
        headers: mergedHeaders,
      };

      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        // Laravel CSRF mismatch -> 419
        if (response.status === 419) {
          return {
            success: false,
            message: 'CSRF token mismatch or session expired (419). Reload and try again.',
          };
        }

        if (response.status === 422 && typeof payload === 'object' && (payload as any).errors) {
          return {
            success: false,
            errors: (payload as any).errors,
            message: (payload as any).message || 'Validation failed',
          };
        }

        return {
          success: false,
          message:
            (typeof payload === 'object' && (payload as any).message) ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return typeof payload === 'object' ? payload : { success: true, data: payload as any };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const qs = new URLSearchParams(
        Object.entries(params).reduce((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      if (qs) url += (endpoint.includes('?') ? '&' : '?') + qs;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const csrfToken = this.getCSRFToken();

    // Let the browser set multipart headers automatically
    return this.request<T>(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      },
      body: formData,
    });
  }
}

// ✅ Export instance
export const apiClient = new ApiClient();
export { ApiClient };
