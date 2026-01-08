export const getApiUrl = () => {
  // 1. Manual Override (useful for debugging)
  if (typeof window !== 'undefined') {
    const manualOverride = localStorage.getItem('API_URL_OVERRIDE');
    if (manualOverride) return manualOverride;
  }

  if (typeof window === 'undefined') return 'http://localhost:8000';

  const { hostname, protocol, port, origin } = window.location;

  // 2. Localhost Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000`;
  }

  // 3. Cloud IDEs (Project IDX, Codespaces, Gitpod)
  // Pattern A: Port at start (e.g. 3000-xyz.idx.dev -> 8000-xyz.idx.dev)
  const portRegex = /^(\d+)-/;
  const match = hostname.match(portRegex);
  if (match) {
    const currentPort = match[1];
    if (['3000', '5173', '8080', '4200'].includes(currentPort)) {
      const newHostname = hostname.replace(currentPort + '-', '8000-');
      return `${protocol}//${newHostname}`;
    }
  }

  // Pattern B: Port in middle/end (e.g. project-3000.dev -> project-8000.dev)
  if (hostname.includes('-3000')) {
    return `${protocol}//${hostname.replace('-3000', '-8000')}`;
  }

  // 4. Standard Port Mapping (e.g. domain.com:3000 -> domain.com:8000)
  if (port && ['3000', '5173', '8080'].includes(port)) {
    return origin.replace(port, '8000');
  }

  // 5. Environment Variable (Build time)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
      // @ts-ignore
      return process.env.REACT_APP_API_URL;
    }
  } catch (e) {}

  // 6. Production Fallback (Render)
  return 'https://cloud-deploy-api-m77w.onrender.com';
};

const API_URL = getApiUrl();
console.log('🔗 API URL configured to:', API_URL); 

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper to handle errors consistently
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await res.json().catch(() => ({})); 
    
    if (!res.ok) {
      throw {
        status: res.status,
        message: data.detail || data.message || 'Request failed',
        detail: data.detail,
        url: url 
      };
    }
    return data;
  } catch (error: any) {
    // Handle Network Errors (Server down, CORS, Wrong URL)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`❌ Network Error connecting to: ${url}`);
      throw {
        message: `Unable to connect to backend at ${API_URL}`,
        url: url,
        isNetworkError: true,
        originalError: error
      };
    }
    throw error;
  }
};

export const api = {
  url: API_URL, // Export base URL for UI display
  auth: {
    login: (creds: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
    register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => fetchAPI('/users/me', { headers: getAuthHeaders() }),
  },
  projects: {
    list: () => fetchAPI('/projects', { headers: getAuthHeaders() }),
    create: (data: any) => fetchAPI('/projects', { 
      method: 'POST', 
      headers: getAuthHeaders(),
      body: JSON.stringify(data) 
    }),
    get: (id: number) => fetchAPI(`/projects/${id}`, { headers: getAuthHeaders() }),
    deploy: (id: number) => fetchAPI(`/projects/${id}/deploy`, { 
      method: 'POST', 
      headers: getAuthHeaders() 
    }),
  },
  deployments: {
    getLogs: (id: number) => fetchAPI(`/deployments/${id}/logs`, { headers: getAuthHeaders() })
  }
};
