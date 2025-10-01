// @/utils/api.ts

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function joinUrl(base: string, path: string): string {
  if (path.startsWith('http')) return path;
  if (!base) return path.startsWith('/') ? path : '/' + path;
  const a = base.endsWith('/') ? base.slice(0, -1) : base;
  const b = path.startsWith('/') ? path : '/' + path;
  return a + b;
}

class ApiClient {
  private baseURL: string;
  private csrfReady = false;

  constructor(baseURL: string = '') {
    this.baseURL =
      baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  private xsrfHeader(): Record<string, string> {
    // Prefer Sanctum cookie (rotates safely; no stale meta)
    const xsrf = readCookie('XSRF-TOKEN');
    return xsrf ? { 'X-XSRF-TOKEN': xsrf } : {};
  }

  private async ensureCsrfCookie(force = false): Promise<void> {
    if (this.csrfReady && !force) return;
    try {
      // Sanctum endpoint; if not installed, the catch will fallback
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    } catch {
      // Fallback: hit home to refresh session cookie on plain Laravel
      await fetch('/', { credentials: 'include' });
    } finally {
      this.csrfReady = true;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = (options.method || 'GET').toUpperCase();
    const isRead = method === 'GET' || method === 'HEAD';

    try {
      if (!isRead) {
        await this.ensureCsrfCookie();
      }

      const defaultHeaders: HeadersInit = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...this.xsrfHeader(), // send X-XSRF-TOKEN from cookie
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

      const url = joinUrl(this.baseURL, endpoint);

      const config: RequestInit = {
        method,
        headers: mergedHeaders,
        credentials: 'include', // send session + XSRF cookies
        ...options,
      };

      let response = await fetch(url, config);

      // If session rotated or token stale: auto-refresh once and retry
      if (response.status === 419 && !(config as any).__isRetry) {
        await this.ensureCsrfCookie(true);
        (config as any).__isRetry = true;
        // Refresh header with the (possibly new) cookie value
        (config.headers as any) = {
          ...mergedHeaders,
          ...this.xsrfHeader(),
        };
        response = await fetch(url, config);
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        if (response.status === 419) {
          return {
            success: false,
            message:
              'CSRF token mismatch or session expired (419). Please try again.',
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

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
export { ApiClient };
