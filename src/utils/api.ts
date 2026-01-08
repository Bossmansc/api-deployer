const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';

  const { hostname, protocol, port } = window.location;

  // 1. Localhost Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000`;
  }

  // 2. Cloud IDEs (Project IDX, Codespaces, Gitpod)
  const portRegex = /^(\d+)-/;
  const match = hostname.match(portRegex);
  if (match) {
    const currentPort = match[1];
    if (['3000', '5173', '8080', '4200'].includes(currentPort)) {
      const newHostname = hostname.replace(currentPort + '-', '8000-');
      return `${protocol}//${newHostname}`;
    }
  }

  // Handle port mapping if visible in URL
  if (port && ['3000', '5173', '8080'].includes(port)) {
    return `${protocol}//${hostname}:8000`;
  }

  // 3. Environment Variable Fallback
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
      // @ts-ignore
      return process.env.REACT_APP_API_URL;
    }
  } catch (e) {}

  // 4. Production Fallback (Your Render URL)
  return 'https://cloud-deploy-api-m77w.onrender.com';
};

const API_URL = getApiUrl();
console.log('🔗 API URL configured to:', API_URL); 

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
      try {
        const res = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        
        const responseData = await res.json();
        if (!res.ok) throw responseData;
        return responseData;
      } catch (error) {
        throw error;
      }
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
