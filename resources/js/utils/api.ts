// @/utils/api.ts

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;
  private csrfReady = false;

  constructor(baseURL: string = '') {
    this.baseURL =
      baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  private getCSRFToken(): string | null {
    return (
      document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') || null
    );
  }

  private async ensureCsrfCookie(): Promise<void> {
    if (this.csrfReady) return;
    // Laravel Sanctum endpoint that sets XSRF-TOKEN + laravel_session
    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    this.csrfReady = true;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const method = (options.method || 'GET').toUpperCase();
      if (method !== 'GET' && method !== 'HEAD') {
        await this.ensureCsrfCookie();
      }

      const csrfToken = this.getCSRFToken();

      const defaultHeaders: HeadersInit = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      };

      // Only set Content-Type for JSON bodies, not FormData
      if (!(options.body instanceof FormData)) {
        (defaultHeaders as any)['Content-Type'] =
          (options.headers as any)?.['Content-Type'] || 'application/json';
      }

      const mergedHeaders: HeadersInit = {
        ...defaultHeaders,
        ...(options.headers || {}),
      };

      const url = endpoint.startsWith('http')
        ? endpoint
        : `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        method,
        headers: mergedHeaders,
        credentials: 'include', // always include cookies (prod needs this)
        ...options,
      };

      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        if (response.status === 419) {
          return {
            success: false,
            message:
              'CSRF token mismatch or session expired (419). Reload and try again.',
          };
        }

        if (
          response.status === 422 &&
          typeof payload === 'object' &&
          (payload as any).errors
        ) {
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

      return typeof payload === 'object'
        ? payload
        : { success: true, data: payload as any };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
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

  async post<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T = any>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// ✅ Export instance
export const apiClient = new ApiClient();
export { ApiClient };
