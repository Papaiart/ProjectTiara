const API = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const BASE = import.meta.env.BASE_URL || '/';

// Statikus kep URL-jenek feloldasa.
// Ha a kep teljes URL (http...), ugy hagyjuk (pl. feltoltott kep a backendrol).
// Kulonben a frontend public mappajabol toltjuk (pl. "badges/borito-bingo.svg").
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path) || /^data:/.test(path)) return path;
  return BASE.replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
}

function getToken() {
  return localStorage.getItem('tiara_token');
}

async function request(method, path, body, isForm = false) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = 'Bearer ' + t;

  let payload;
  if (isForm) {
    payload = body; // FormData - a bongesző allitja be a Content-Type-ot
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API + path, { method, headers, body: payload });
  } catch {
    throw new Error('Nem sikerült elérni a szervert. Fut a backend?');
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.error) || 'Hiba történt.');
  return data;
}

export const api = {
  API_URL: API,
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('POST', '/api/uploads', fd, true);
  },
};
