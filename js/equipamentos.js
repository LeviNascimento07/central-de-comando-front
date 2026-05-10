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

function formatarMoeda(v) {
  if (v === null || v === undefined) return '–';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let modalBootstrap;

async function carregarEquipamentos() {
  try {
    const dados = await Equipamentos.listar();
    const lista = Array.isArray(dados) ? dados : [];
    const tbody = document.getElementById('tabela-equipamentos');

    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum equipamento cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(e => `
      <tr>
        <td class="ps-4"><span class="badge bg-secondary">#${e.equipamento_id}</span></td>
        <td>${e.descricao || '–'}</td>
        <td>${formatarMoeda(e.valor_diaria)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick='abrirModalEditar(${JSON.stringify(e)})'>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="excluirEquipamento(${e.equipamento_id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('tabela-equipamentos').innerHTML =
      `<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao carregar equipamentos.</td></tr>`;
  }
}

function abrirModalIncluir() {
  document.getElementById('modalEquipamentoLabel').textContent = 'Incluir Equipamento';
  document.getElementById('equip-id').value = '';
  document.getElementById('equip-descricao').value = '';
  document.getElementById('equip-valor').value = '';
  document.getElementById('modal-alert').innerHTML = '';
}

function abrirModalEditar(e) {
  document.getElementById('modalEquipamentoLabel').textContent = 'Editar Equipamento';
  document.getElementById('equip-id').value = e.equipamento_id;
  document.getElementById('equip-descricao').value = e.descricao || '';
  document.getElementById('equip-valor').value = e.valor_diaria ?? '';
  document.getElementById('modal-alert').innerHTML = '';
  modalBootstrap.show();
}

async function salvarEquipamento() {
  const id = document.getElementById('equip-id').value;
  const descricao = document.getElementById('equip-descricao').value.trim();
  const valor_diaria = parseFloat(document.getElementById('equip-valor').value);

  if (!descricao || isNaN(valor_diaria)) {
    showAlert('Preencha todos os campos.', 'danger', 'modal-alert');
    return;
  }

  const dados = { descricao, valor_diaria };

  try {
    if (id) {
      await Equipamentos.atualizar(id, dados);
    } else {
      await Equipamentos.criar(dados);
    }
    modalBootstrap.hide();
    showAlert('Equipamento salvo com sucesso!', 'success');
    carregarEquipamentos();
  } catch (err) {
    showAlert('Erro ao salvar: ' + err.message, 'danger', 'modal-alert');
  }
}

async function excluirEquipamento(id) {
  if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;
  try {
    await Equipamentos.excluir(id);
    showAlert('Equipamento excluído com sucesso!', 'success');
    carregarEquipamentos();
  } catch (err) {
    showAlert('Erro ao excluir: ' + err.message);
  }
}

verificarSessao();
document.getElementById('nome-usuario').textContent =
  sessionStorage.getItem('nomeUsuario') || sessionStorage.getItem('usuarioLogado');

modalBootstrap = new bootstrap.Modal(document.getElementById('modalEquipamento'));
carregarEquipamentos();
