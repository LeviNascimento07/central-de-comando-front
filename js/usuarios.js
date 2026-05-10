function verificarSessao() {
  if (!sessionStorage.getItem('usuarioLogado')) window.location.href = 'index.html';
}

function sair() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

function showAlert(msg, tipo = 'danger', container = 'alert-box') {
  document.getElementById(container).innerHTML =
    `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
       <i class="bi bi-${tipo === 'danger' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${msg}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     </div>`;
}

function formatarData(str) {
  if (!str) return '–';
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

let modalBootstrap;

async function carregarUsuarios() {
  try {
    const dados = await Usuarios.listar();
    const lista = Array.isArray(dados) ? dados : [];
    const tbody = document.getElementById('tabela-usuarios');

    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Nenhum usuário cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(u => `
      <tr>
        <td class="ps-4"><span class="badge bg-secondary">#${u.usuario_id}</span></td>
        <td>${u.nome || '–'}</td>
        <td><code>${u.login || '–'}</code></td>
        <td class="text-muted small">${formatarData(u.atualizado_em)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick='abrirModalEditar(${JSON.stringify(u)})'>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="excluirUsuario(${u.usuario_id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('tabela-usuarios').innerHTML =
      `<tr><td colspan="5" class="text-center py-4 text-danger">Erro ao carregar usuários.</td></tr>`;
  }
}

function abrirModalIncluir() {
  document.getElementById('modalUsuarioLabel').textContent = 'Incluir Usuário';
  document.getElementById('usuario-id').value = '';
  document.getElementById('usuario-nome').value = '';
  document.getElementById('usuario-login').value = '';
  document.getElementById('usuario-senha').value = '';
  document.getElementById('modal-alert').innerHTML = '';
}

function abrirModalEditar(u) {
  document.getElementById('modalUsuarioLabel').textContent = 'Editar Usuário';
  document.getElementById('usuario-id').value = u.usuario_id;
  document.getElementById('usuario-nome').value = u.nome || '';
  document.getElementById('usuario-login').value = u.login || '';
  document.getElementById('usuario-senha').value = '';
  document.getElementById('modal-alert').innerHTML = '';
  modalBootstrap.show();
}

async function salvarUsuario() {
  const id = document.getElementById('usuario-id').value;
  const dados = {
    nome: document.getElementById('usuario-nome').value.trim(),
    login: document.getElementById('usuario-login').value.trim(),
    senha: document.getElementById('usuario-senha').value,
  };

  if (!dados.nome || !dados.login || (!id && !dados.senha)) {
    showAlert('Preencha Nome, Login e Senha.', 'danger', 'modal-alert');
    return;
  }

  try {
    if (id) {
      if (!dados.senha) delete dados.senha;
      await Usuarios.atualizar(id, dados);
    } else {
      await Usuarios.criar(dados);
    }
    modalBootstrap.hide();
    showAlert('Usuário salvo com sucesso!', 'success');
    carregarUsuarios();
  } catch (err) {
    showAlert('Erro ao salvar: ' + err.message, 'danger', 'modal-alert');
  }
}

async function excluirUsuario(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  try {
    await Usuarios.excluir(id);
    showAlert('Usuário excluído com sucesso!', 'success');
    carregarUsuarios();
  } catch (err) {
    showAlert('Erro ao excluir: ' + err.message);
  }
}

verificarSessao();
document.getElementById('nome-usuario').textContent =
  sessionStorage.getItem('nomeUsuario') || sessionStorage.getItem('usuarioLogado');

modalBootstrap = new bootstrap.Modal(document.getElementById('modalUsuario'));
carregarUsuarios();
