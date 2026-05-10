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

// status_id (int) <-> label (string)
const STATUS_LABEL = { 1: 'Aberto', 2: 'Em Andamento', 3: 'Resolvido', 4: 'Fechado' };
const STATUS_ID    = { 'Aberto': 1, 'Em Andamento': 2, 'Resolvido': 3, 'Fechado': 4 };
const STATUS_COR   = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'secondary' };

function badgeStatus(status_id) {
  const label = STATUS_LABEL[status_id] || `Status ${status_id}`;
  const cor   = STATUS_COR[status_id] || 'light';
  return `<span class="badge bg-${cor}">${label}</span>`;
}

function formatarData(str) {
  if (!str) return '–';
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString('pt-BR');
}

let modalBootstrap;
let listaEquipamentos = [];

async function carregarEquipamentosSelect() {
  try {
    const dados = await Equipamentos.listar();
    listaEquipamentos = Array.isArray(dados) ? dados : [];
    const sel = document.getElementById('inc-equipamento');
    const opcoes = listaEquipamentos
      .map(e => `<option value="${e.equipamento_id}">${e.descricao}</option>`)
      .join('');
    sel.innerHTML = '<option value="">Selecione...</option>' + opcoes;
  } catch (_) {
    // equipamento é opcional, segue sem bloquear
  }
}

async function carregarIncidentes() {
  try {
    const dados = await Incidentes.listar();
    const lista = Array.isArray(dados) ? dados : [];
    const tbody = document.getElementById('tabela-incidentes');

    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum incidente cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(i => {
      const equip = listaEquipamentos.find(e => e.equipamento_id === i.equipamento_id);
      const nomeEquip = equip ? equip.descricao : (i.equipamento_id ? `#${i.equipamento_id}` : '–');
      return `
        <tr>
          <td class="ps-4"><span class="badge bg-secondary">#${i.incidente_id}</span></td>
          <td>${formatarData(i.data)}</td>
          <td>${i.descricao || '–'}</td>
          <td>${nomeEquip}</td>
          <td>${badgeStatus(i.status_id)}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary me-1" onclick='abrirModalEditar(${JSON.stringify(i)})'>
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirIncidente(${i.incidente_id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('tabela-incidentes').innerHTML =
      `<tr><td colspan="6" class="text-center py-4 text-danger">Erro ao carregar incidentes.</td></tr>`;
  }
}

function abrirModalIncluir() {
  document.getElementById('modalIncidenteLabel').textContent = 'Incluir Incidente';
  document.getElementById('inc-id').value = '';
  document.getElementById('inc-descricao').value = '';
  document.getElementById('inc-equipamento').value = '';
  document.getElementById('inc-status').value = '';
  document.getElementById('modal-alert').innerHTML = '';
}

function abrirModalEditar(i) {
  document.getElementById('modalIncidenteLabel').textContent = 'Editar Incidente';
  document.getElementById('inc-id').value = i.incidente_id;
  document.getElementById('inc-descricao').value = i.descricao || '';
  document.getElementById('inc-equipamento').value = i.equipamento_id || '';
  // select usa o label; converte status_id → label
  document.getElementById('inc-status').value = STATUS_LABEL[i.status_id] || '';
  document.getElementById('modal-alert').innerHTML = '';
  modalBootstrap.show();
}

async function salvarIncidente() {
  const id = document.getElementById('inc-id').value;
  const descricao = document.getElementById('inc-descricao').value.trim();
  const equipamento_id = parseInt(document.getElementById('inc-equipamento').value) || 0;
  const statusLabel = document.getElementById('inc-status').value;
  const status_id = STATUS_ID[statusLabel] || 0;

  if (!descricao || !status_id) {
    showAlert('Preencha Descrição e Status.', 'danger', 'modal-alert');
    return;
  }

  const dados = { descricao, equipamento_id, status_id };

  try {
    if (id) {
      await Incidentes.atualizar(id, dados);
    } else {
      await Incidentes.criar(dados);
    }
    modalBootstrap.hide();
    showAlert('Incidente salvo com sucesso!', 'success');
    carregarIncidentes();
  } catch (err) {
    showAlert('Erro ao salvar: ' + err.message, 'danger', 'modal-alert');
  }
}

async function excluirIncidente(id) {
  if (!confirm('Tem certeza que deseja excluir este incidente?')) return;
  try {
    await Incidentes.excluir(id);
    showAlert('Incidente excluído com sucesso!', 'success');
    carregarIncidentes();
  } catch (err) {
    showAlert('Erro ao excluir: ' + err.message);
  }
}

verificarSessao();
document.getElementById('nome-usuario').textContent =
  sessionStorage.getItem('nomeUsuario') || sessionStorage.getItem('usuarioLogado');

modalBootstrap = new bootstrap.Modal(document.getElementById('modalIncidente'));

(async () => {
  await carregarEquipamentosSelect();
  await carregarIncidentes();
})();
