let bipagemAtual = [];

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
menuBtn.onclick = () => menu.classList.toggle("hidden");

function adicionarBipagem() {
  const codigoInput = document.getElementById("codigo");
  const codigo = codigoInput.value.trim();
  const lista = document.getElementById("listaBipagem");
  const msg = document.getElementById("mensagem");

  if(codigo.length !== 12 || !codigo.includes('-')) {
    msg.innerText = "Código inválido!";
    codigoInput.value = "";
    return;
  }

  if(bipagemAtual.includes(codigo)) {
    msg.innerText = "Código já adicionado!";
    codigoInput.value = "";
    return;
  }

  bipagemAtual.push(codigo);
  const li = document.createElement("li");
  li.textContent = codigo;
  lista.appendChild(li);
  codigoInput.value = "";
  msg.innerText = "";
}

async function registrarColeta() {
  const motorista = document.getElementById("motorista").value;
  const loja = document.getElementById("loja").value.trim();
  const msg = document.getElementById("mensagem");

  if(!motorista || !loja || bipagemAtual.length === 0) {
    msg.innerText = "Preencha todos os campos e adicione pedidos!";
    return;
  }

  const resp = await fetch("/registrar", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({motorista, loja, codigos: bipagemAtual})
  });
  const data = await resp.json();
  msg.innerText = data.mensagem;
  bipagemAtual = [];
  document.getElementById("listaBipagem").innerHTML = "";
}

// Histórico
async function mostrarHistorico() {
  document.getElementById("tela-principal").classList.add("hidden");
  document.getElementById("historico").classList.remove("hidden");

  const resp = await fetch("/historico");
  const dados = await resp.json();
  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "";

  dados.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.data} - ${item.motorista} - Loja: ${item.loja} - ${item.total} pedidos`;
    li.onclick = () => mostrarDetalhes(item.motorista, item.loja, item.data);
    lista.appendChild(li);
  });
}

async function mostrarDetalhes(motorista, loja, data) {
  document.getElementById("historico").classList.add("hidden");
  document.getElementById("detalhes").classList.remove("hidden");

  const resp = await fetch(`/detalhes?motorista=${encodeURIComponent(motorista)}&loja=${encodeURIComponent(loja)}&data=${encodeURIComponent(data)}`);
  const dados = await resp.json();
  const lista = document.getElementById("listaDetalhes");
  lista.innerHTML = "";

  dados.forEach(codigo => {
    const li = document.createElement("li");
    li.textContent = codigo;
    lista.appendChild(li);
  });
}

function voltar() {
  document.getElementById("historico").classList.add("hidden");
  document.getElementById("tela-principal").classList.remove("hidden");
}

function voltarHistorico() {
  document.getElementById("detalhes").classList.add("hidden");
  mostrarHistorico();
}

function copiarPedidos() {
  const lista = document.getElementById("listaDetalhes");
  const textos = Array.from(lista.children).map(li => li.textContent).join('\n');
  navigator.clipboard.writeText(textos);
  alert("Pedidos copiados!");
}

function gerarBackup() {
  window.location.href = '/backup';
}
