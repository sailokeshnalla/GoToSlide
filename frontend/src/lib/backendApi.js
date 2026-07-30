import { supabase } from './supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

class BackendApi {
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers
    };

    const url = `${BACKEND_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Handle unauthorized (e.g. token expired, missing)
        throw new Error('Authentication expired or invalid');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`BackendAPI Error (${endpoint}):`, error);
      throw error;
    }
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

export const backendApi = new BackendApi();
