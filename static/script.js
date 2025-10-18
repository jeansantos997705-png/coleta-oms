let listaBipagem = [];
const listaUl = document.getElementById('lista-bipagem');
const contador = document.getElementById('contador');
const mensagem = document.getElementById('mensagem');

const codigoInput = document.getElementById('codigo');
codigoInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    adicionarCodigo();
  }
});

function adicionarCodigo() {
  const codigo = codigoInput.value.trim();
  if (!/^.{12}$/.test(codigo)) {
    mensagem.textContent = "Código inválido";
    mensagem.style.color = "red";
    return;
  }
  if (listaBipagem.includes(codigo)) {
    mensagem.textContent = "Código duplicado";
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
  listaBipagem.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    listaUl.appendChild(li);
  });
  contador.textContent = listaBipagem.length;
}

async function registrar() {
  const motorista = document.getElementById('motorista').value;
  const loja = document.getElementById('loja').value;
  if (!motorista || !loja || listaBipagem.length === 0) {
    mensagem.textContent = "Preencha todos os campos e adicione códigos";
    mensagem.style.color = "red";
    return;
  }
  const res = await fetch('/registrar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({motorista, loja, pedidos: listaBipagem})
  });
  if (res.ok) {
    mensagem.textContent = "Pedidos registrados!";
    mensagem.style.color = "green";
    listaBipagem = [];
    atualizarLista();
  } else {
    mensagem.textContent = "Erro ao registrar";
    mensagem.style.color = "red";
  }
}

// Registro
function abrirRegistro() {
  document.getElementById('bipagem-page').classList.add('hidden');
  document.getElementById('registro-page').classList.remove('hidden');
  carregarRegistro();
}

function fecharRegistro() {
  document.getElementById('registro-page').classList.add('hidden');
  document.getElementById('bipagem-page').classList.remove('hidden');
  document.getElementById('pedidos-detalhes').classList.add('hidden');
}

async function carregarRegistro() {
  const res = await fetch('/registro');
  const registros = await res.json();
  const container = document.getElementById('registro-lista');
  container.innerHTML = '';
  registros.forEach((r, index) => {
    const div = document.createElement('div');
    div.className = 'coleta-item';
    div.textContent = `${r.motorista} - ${r.loja} - ${r.data} ${r.hora} - ${r.pedidos.length} pedidos`;
    div.onclick = () => mostrarPedidos(r.pedidos);
    container.appendChild(div);
  });
}

function mostrarPedidos(pedidos) {
  const lista = document.getElementById('pedidos-lista');
  lista.innerHTML = '';
  pedidos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    lista.appendChild(li);
  });
  document.getElementById('pedidos-detalhes').classList.remove('hidden');
}

function copiarPedidos() {
  const lista = document.getElementById('pedidos-lista');
  const codigos = Array.from(lista.children).map(li => li.textContent).join('\n');
  navigator.clipboard.writeText(codigos);
  alert("Pedidos copiados!");
}
