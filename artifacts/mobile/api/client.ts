const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? 'localhost'}/api`;

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString(), { method: 'GET', headers: this.getHeaders() });
    if (!res.ok) throw await this.parseError(res);
    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await this.parseError(res);
    return res.json() as Promise<T>;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await this.parseError(res);
    return res.json() as Promise<T>;
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await this.parseError(res);
    return res.json() as Promise<T>;
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await this.parseError(res);
    return res.json() as Promise<T>;
  }

  private async parseError(res: Response): Promise<ApiError> {
    try {
      const body = (await res.json()) as Record<string, unknown>;
      return {
        message: (body.message as string) ?? 'Request failed',
        statusCode: res.status,
        code: body.code as string | undefined,
      };
    } catch {
      return { message: res.statusText || 'Request failed', statusCode: res.status };
    }
  }
}

export const apiClient = new ApiClient(BASE_URL);
