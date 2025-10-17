// bipagem atual
let bipagemAtual = []; // array de strings

const motoristaEl = () => document.getElementById('motorista');
const lojaEl = () => document.getElementById('loja');
const codigoEl = () => document.getElementById('codigo');
const mensagemEl = () => document.getElementById('mensagem');

function atualizarUILista() {
  const lista = document.getElementById('bipagemAtual');
  lista.innerHTML = '';
  bipagemAtual.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    lista.appendChild(li);
  });
  document.getElementById('contador').innerText = bipagemAtual.length;
}

// adicionar
document.getElementById('btnAdd').addEventListener('click', () => {
  adicionarCodigo();
});
function adicionarCodigo() {
  const codigo = codigoEl().value.trim();
  const motorista = motoristaEl().value.trim();
  const loja = lojaEl().value.trim();
  if (!motorista || !loja) {
    mensagemEl().innerText = 'Preencha motorista e loja.';
    return;
  }
  if (!codigo) {
    mensagemEl().innerText = 'Digite ou bipa um código.';
    return;
  }
  if (codigo.length !== 12 || !codigo.includes('-')) {
    mensagemEl().innerText = 'Código inválido (12 chars com traço).';
    codigoEl().value = '';
    return;
  }
  if (bipagemAtual.includes(codigo)) {
    mensagemEl().innerText = 'Código já adicionado na sessão.';
    codigoEl().value = '';
    return;
  }
  bipagemAtual.push(codigo);
  atualizarUILista();
  mensagemEl().innerText = '';
  codigoEl().value = '';
  codigoEl().focus();
}

// Enter adiciona
codigoEl().addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    adicionarCodigo();
  }
});

// registrar (envia todas as codigos em uma coleta)
document.getElementById('btnRegistrar').addEventListener('click', async () => {
  const motorista = motoristaEl().value.trim();
  const loja = lojaEl().value.trim();
  if (!motorista || !loja || bipagemAtual.length === 0) {
    mensagemEl().innerText = 'Preencha motorista, loja e adicione ao menos um código.';
    return;
  }
  // POST /registrar com codigos array
  const resp = await fetch('/registrar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ motorista, loja, codigos: bipagemAtual })
  });
  const data = await resp.json();
  if (data.status === 'ok') {
    mensagemEl().innerText = data.mensagem || 'Registrado.';
    bipagemAtual = [];
    atualizarUILista();
    carregarHistorico(); // atualiza histórico
  } else {
    mensagemEl().innerText = data.mensagem || 'Erro ao registrar.';
  }
});

// ------------------ Menu / Histórico ------------------
const menuOverlay = document.getElementById('menuOverlay');
const historicoOverlay = document.getElementById('historicoOverlay');

document.getElementById('btnMenu').addEventListener('click', () => {
  menuOverlay.classList.remove('hidden');
});
document.getElementById('btnCloseMenu').addEventListener('click', () => {
  menuOverlay.classList.add('hidden');
});

document.getElementById('btnHistorico').addEventListener('click', () => {
  menuOverlay.classList.add('hidden');
  historicoOverlay.classList.remove('hidden');
  carregarHistorico();
});

document.getElementById('btnCloseHistorico').addEventListener('click', () => {
  historicoOverlay.classList.add('hidden');
  // hide detalhes
  document.getElementById('detalhesBox').classList.add('hidden');
});

// export
document.getElementById('btnExport').addEventListener('click', () => {
  window.location.href = '/backup';
});

// carregar histórico (com filtros)
async function carregarHistorico() {
  const motorista = document.getElementById('filtroMotorista').value;
  const loja = document.getElementById('filtroLoja').value;
  const data = document.getElementById('filtroData').value;

  let url = '/listar?';
  if (motorista) url += `motorista=${encodeURIComponent(motorista)}&`;
  if (loja) url += `loja=${encodeURIComponent(loja)}&`;
  if (data) url += `data=${encodeURIComponent(data)}&`;

  const resp = await fetch(url);
  if (!resp.ok) {
    document.getElementById('listaHistorico').innerHTML = '<li>Erro ao carregar histórico</li>';
    return;
  }
  const registros = await resp.json();
  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';
  if (!registros || registros.length === 0) {
    lista.innerHTML = '<li>Nenhum registro encontrado</li>';
    return;
  }
  registros.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="histRow">
      <div><strong>${r.motorista}</strong> — Loja ${r.loja}</div>
      <div class="small">${r.data}</div>
      <div class="small">Pedidos: ${r.quantidade}</div>
      <div><button class="btn small" onclick="verDetalhes(${r.id})">Ver pedidos</button></div>
    </div>`;
    lista.appendChild(li);
  });
}

// ver detalhes e copiar
async function verDetalhes(id) {
  const resp = await fetch(`/detalhes/${id}`);
  if (!resp.ok) {
    alert('Erro ao carregar detalhes.');
    return;
  }
  const codigos = await resp.json();
  const detalhesBox = document.getElementById('detalhesBox');
  const listaDetalhes = document.getElementById('listaDetalhes');
  listaDetalhes.innerHTML = '';
  codigos.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    listaDetalhes.appendChild(li);
  });
  detalhesBox.classList.remove('hidden');

  // copiar botão
  document.getElementById('btnCopiar').onclick = () => {
    const text = codigos.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Pedidos copiados!');
    });
  };
  document.getElementById('btnFecharDetalhes').onclick = () => {
    detalhesBox.classList.add('hidden');
  };
}

// filtrar botão
document.getElementById('btnFiltrar').addEventListener('click', carregarHistorico);

// auto reload histórico enquanto overlay aberto (opcional)
setInterval(() => {
  if (!historicoOverlay.classList.contains('hidden')) {
    // manter filtros atuais
    carregarHistorico();
  }
}, 7000);

// inicial
atualizarUILista();
