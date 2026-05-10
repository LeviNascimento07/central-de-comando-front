const BASE_URL = 'http://localhost:8080';
const USUARIO_FIXO = 'admin';
const SENHA_FIXA = '123456';

function showAlert(msg, tipo = 'danger') {
  document.getElementById('alert-box').innerHTML =
    `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
       <i class="bi bi-${tipo === 'danger' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${msg}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     </div>`;
}

document.getElementById('toggle-senha').addEventListener('click', () => {
  const input = document.getElementById('senha');
  const icon = document.querySelector('#toggle-senha i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'bi bi-eye';
  }
});

function salvarSessao(login, nome, id) {
  sessionStorage.setItem('usuarioLogado', login);
  sessionStorage.setItem('nomeUsuario', nome);
  if (id) sessionStorage.setItem('usuarioId', id);
  window.location.href = 'home.html';
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const login = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value;

  if (!login || !senha) {
    showAlert('Preencha todos os campos.');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

  // 1. Credencial fixa de admin (sem depender da API)
  if (login === USUARIO_FIXO && senha === SENHA_FIXA) {
    salvarSessao(login, 'Administrador', null);
    return;
  }

  // 2. Autenticação via POST /login
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      salvarSessao(data.usuario.login, data.usuario.nome, data.usuario.usuario_id);
      return;
    }

    showAlert(data.error || 'Usuário ou senha inválidos.');
  } catch (_) {
    showAlert('Não foi possível conectar ao servidor.');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Entrar';
});
