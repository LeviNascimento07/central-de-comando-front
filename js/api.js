const BASE_URL = 'https://central-de-comando-back.onrender.com';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Erro ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

// Usuários
const Usuarios = {
  listar: () => apiFetch('/usuarios'),
  criar: (dados) => apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' }),
};

// Equipamentos
const Equipamentos = {
  listar: () => apiFetch('/equipamentos'),
  criar: (dados) => apiFetch('/equipamentos', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) => apiFetch(`/equipamentos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/equipamentos/${id}`, { method: 'DELETE' }),
};

// Incidentes
const Incidentes = {
  listar: () => apiFetch('/incidentes'),
  criar: (dados) => apiFetch('/incidentes', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) => apiFetch(`/incidentes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/incidentes/${id}`, { method: 'DELETE' }),
};
