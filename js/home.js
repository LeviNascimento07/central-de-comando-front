function verificarSessao() {
  if (!sessionStorage.getItem('usuarioLogado')) {
    window.location.href = 'index.html';
  }
}

function sair() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

const STATUS_LABEL = { 1: 'Aberto', 2: 'Em Andamento', 3: 'Resolvido', 4: 'Fechado' };
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

async function carregarDashboard() {
  try {
    const [incidentes, equipamentos] = await Promise.all([
      Incidentes.listar(),
      Equipamentos.listar().catch(() => []),
    ]);

    const lista  = Array.isArray(incidentes)   ? incidentes   : [];
    const equips = Array.isArray(equipamentos)  ? equipamentos : [];

    const abertos   = lista.filter(i => i.status_id === 1).length;
    const andamento = lista.filter(i => i.status_id === 2).length;
    const resolvidos = lista.filter(i => i.status_id === 3).length;

    document.getElementById('stat-abertos').textContent   = abertos;
    document.getElementById('stat-andamento').textContent = andamento;
    document.getElementById('stat-resolvidos').textContent = resolvidos;
    document.getElementById('stat-total').textContent      = lista.length;

    const recentes = lista.slice(-10).reverse();
    const tbody = document.getElementById('tabela-recentes');

    if (recentes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Nenhum incidente encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = recentes.map(i => {
      const equip = equips.find(e => e.equipamento_id === i.equipamento_id);
      const nomeEquip = equip ? equip.descricao : (i.equipamento_id ? `#${i.equipamento_id}` : '–');
      return `
        <tr>
          <td class="ps-4"><span class="badge bg-secondary">#${i.incidente_id}</span></td>
          <td>${formatarData(i.data)}</td>
          <td>${i.descricao || '–'}</td>
          <td>${nomeEquip}</td>
          <td>${badgeStatus(i.status_id)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('tabela-recentes').innerHTML =
      `<tr><td colspan="5" class="text-center py-4 text-danger"><i class="bi bi-exclamation-circle me-2"></i>Erro ao carregar incidentes.</td></tr>`;
  }
}

verificarSessao();
const nome = sessionStorage.getItem('nomeUsuario') || sessionStorage.getItem('usuarioLogado');
document.getElementById('nome-usuario').textContent = nome;
document.getElementById('hero-nome').textContent = nome;
carregarDashboard();
