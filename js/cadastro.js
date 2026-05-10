const BASE_URL = 'https://central-de-comando-back.onrender.com';

function showAlert(msg, tipo = 'danger') {
  document.getElementById('alert-box').innerHTML =
    `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
       <i class="bi bi-${tipo === 'danger' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${msg}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     </div>`;
}

document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const login = document.getElementById('login').value.trim();
  const profissao = document.getElementById('profissao').value;
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;

  if (!nome || !login || !profissao || !senha || !confirmar) {
    showAlert('Preencha todos os campos.');
    return;
  }

  if (senha.length < 6) {
    showAlert('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  if (senha !== confirmar) {
    showAlert('As senhas não coincidem.');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...';

  try {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, login, senha }),
    });

    if (!res.ok) {
      const texto = await res.text().catch(() => res.statusText);
      throw new Error(texto || `Erro ${res.status}`);
    }

    showAlert('Conta criada com sucesso! Redirecionando...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  } catch (err) {
    showAlert('Erro ao cadastrar: ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Cadastrar';
  }
});
