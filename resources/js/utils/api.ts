// @/utils/api.ts

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
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
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
            };

            const mergedHeaders: HeadersInit = {
                ...defaultHeaders,
                ...(options.headers || {}),
            };

            const config: RequestInit = {
                method: options.method || 'GET',
                headers: mergedHeaders,
                credentials: 'same-origin', // Include cookies for session auth
                ...options,
            };

            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                if (response.status === 422 && typeof data === 'object' && data.errors) {
                    return {
                        success: false,
                        errors: data.errors,
                        message: data.message || 'Validation failed',
                    };
                }

                return {
                    success: false,
                    message: (typeof data === 'object' && data.message) || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            return typeof data === 'object' ? data : { success: true, data };
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
            const queryString = new URLSearchParams(
                Object.entries(params).reduce((acc, [key, value]) => {
                    if (value !== undefined && value !== null) {
                        acc[key] = String(value);
                    }
                    return acc;
                }, {} as Record<string, string>)
            ).toString();

            if (queryString) {
                url += `?${queryString}`;
            }
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

        return this.request<T>(endpoint, {
            method: 'POST',
            headers: {
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
