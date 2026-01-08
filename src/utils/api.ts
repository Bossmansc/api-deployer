const API_URL = 'http://localhost:8000'; // Adjust if backend URL differs

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    me: async () => {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
  },
  projects: {
    list: async () => {
      const res = await fetch(`${API_URL}/projects`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    create: async (data: { name: string; github_url: string }) => {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    get: async (id: number) => {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    deploy: async (id: number) => {
      const res = await fetch(`${API_URL}/projects/${id}/deploy`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
  },
  deployments: {
    getLogs: async (id: number) => {
      const res = await fetch(`${API_URL}/deployments/${id}/logs`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  }
};
