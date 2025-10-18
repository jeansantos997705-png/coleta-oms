let listaBipagem = [];
let historico = [];

const codigoInput = document.getElementById('codigo');
const listaUl = document.getElementById('lista-bipagem');
const contador = document.getElementById('contador');
const mensagem = document.getElementById('mensagem');

codigoInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    adicionarCodigo();
  }
});

function adicionarCodigo() {
  const codigo = codigoInput.value.trim();
  if (!/^.{11,12}$/.test(codigo)) {
    mensagem.textContent = "Código inválido";
    mensagem.style.color = "red";
    return;
  }
  listaBipagem.push(codigo);
  atualizarLista();
  codigoInput.value = '';
  mensagem.textContent = '';
}

function atualizarLista() {
  listaUl.innerHTML = '';
  listaBipagem.forEach(codigo => {
    const li = document.createElement('li');
    li.textContent = codigo;
    listaUl.appendChild(li);
  });
  contador.textContent = listaBipagem.length;
}

function registrar() {
  const motorista = document.getElementById('motorista').value;
  const loja = document.getElementById('loja').value;
  if (!motorista || !loja || listaBipagem.length === 0) {
    mensagem.textContent = "Preencha todos os campos antes de registrar";
    mensagem.style.color = "red";
    return;
  }
  const data = new Date();
  historico.push({
    motorista,
    loja,
    data: data.toLocaleDateString(),
    hora: data.getHours() + ':' + ('0'+data.getMinutes()).slice(-2),
    pedidos: [...listaBipagem]
  });
  listaBipagem = [];
  atualizarLista();
  mensagem.textContent = "Pedidos registrados com sucesso!";
  mensagem.style.color = "green";
}

function abrirHistorico() {
  document.getElementById('main-page').classList.add('hidden');
  document.getElementById('historico-page').classList.remove('hidden');
  renderHistorico();
}

function fecharHistorico() {
  document.getElementById('historico-page').classList.add('hidden');
  document.getElementById('main-page').classList.remove('hidden');
}

function renderHistorico() {
  const container = document.getElementById('historico-lista');
  container.innerHTML = '';
  historico.forEach((h, index) => {
    const div = document.createElement('div');
    div.className = 'coleta-item';
    div.innerHTML = `${h.motorista} - Loja ${h.loja} - ${h.data} ${h.hora} - ${h.pedidos.length} pedidos`;
    div.onclick = () => mostrarPedidos(index);
    container.appendChild(div);
  });
}

function mostrarPedidos(index) {
  const detalhes = document.getElementById('pedidos-detalhes');
  const lista = document.getElementById('pedidos-lista');
  lista.innerHTML = '';
  historico[index].pedidos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    lista.appendChild(li);
  });
  detalhes.classList.remove('hidden');
}

function copiarPedidos() {
  const lista = document.getElementById('pedidos-lista');
  const codigos = Array.from(lista.children).map(li => li.textContent).join('\n');
  navigator.clipboard.writeText(codigos);
  alert("Pedidos copiados!");
}

function aplicarFiltros() {
  const motoristaFiltro = document.getElementById('filtro-motorista').value.toLowerCase();
  const lojaFiltro = document.getElementById('filtro-loja').value.toLowerCase();
  const dataFiltro = document.getElementById('filtro-data').value;

  const container = document.getElementById('historico-lista');
  container.innerHTML = '';
  historico.forEach((h, index) => {
    if (
      (motoristaFiltro && !h.motorista.toLowerCase().includes(motoristaFiltro)) ||
      (lojaFiltro && !h.loja.toLowerCase().includes(lojaFiltro)) ||
      (dataFiltro && h.data !== dataFiltro)
    ) return;

    const div = document.createElement('div');
    div.className = 'coleta-item';
    div.innerHTML = `${h.motorista} - Loja ${h.loja} - ${h.data} ${h.hora} - ${h.pedidos.length} pedidos`;
    div.onclick = () => mostrarPedidos(index);
    container.appendChild(div);
  });
}
