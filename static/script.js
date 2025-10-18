let bipagemAtual = [];

const codigoInput = document.getElementById("codigo");
codigoInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    adicionarCodigo();
  }
});

function adicionarCodigo() {
  const codigo = codigoInput.value.trim();
  const msg = document.getElementById("mensagem");

  if (!codigo) {
    msg.innerText = "Informe um código!";
    return;
  }

  if (codigo.length !== 12) { // 12 com traço
    msg.innerText = "Código inválido! Deve ter 12 caracteres.";
    return;
  }

  if (bipagemAtual.find(item => item.codigo === codigo)) {
    msg.innerText = "Código já foi adicionado na coleta atual!";
    return;
  }

  const motorista = document.getElementById("motorista").value;
  const loja = document.getElementById("loja").value.trim();

  if (!motorista || !loja) {
    msg.innerText = "Selecione motorista e insira a loja!";
    return;
  }

  bipagemAtual.push({ codigo, motorista, loja });
  atualizarBipagem();
  codigoInput.value = "";
  msg.innerText = "";
}

function atualizarBipagem() {
  const lista = document.getElementById("lista-bipagem");
  lista.innerHTML = "";
  bipagemAtual.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.codigo} - ${item.loja} - ${item.motorista}`;
    lista.appendChild(li);
  });
  document.getElementById("contador").innerText = bipagemAtual.length;
}

async function registrar() {
  if (!bipagemAtual.length) return;

  const resp = await fetch("/registrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bipagemAtual)
  });

  const data = await resp.json();
  document.getElementById("mensagem").innerText = data.mensagem;
  bipagemAtual = [];
  atualizarBipagem();
}

// ---------------- Histórico ----------------
async function abrirHistorico() {
  document.getElementById("main-page").classList.add("hidden");
  document.getElementById("historico-page").classList.remove("hidden");

  const resp = await fetch("/listar");
  const dados = await resp.json();

  const agrupados = {};
  dados.forEach(item => {
    const chave = `${item.motorista}|${item.loja}|${item.data}`;
    if (!agrupados[chave]) agrupados[chave] = [];
    agrupados[chave].push(item.codigo);
  });

  const historicoLista = document.getElementById("historico-lista");
  historicoLista.innerHTML = "";

  // Filtros
  const filtroContainer = document.createElement("div");
  filtroContainer.innerHTML = `
    <input type="text" id="filtro-motorista" placeholder="Motorista">
    <input type="text" id="filtro-loja" placeholder="Loja">
    <input type="text" id="filtro-data" placeholder="Data">
    <button onclick="aplicarFiltro()">Filtrar</button>
  `;
  historicoLista.appendChild(filtroContainer);

  function renderListaFiltrada(filtro) {
    // Limpa itens antigos
    const antigos = historicoLista.querySelectorAll(".coleta-item");
    antigos.forEach(a => a.remove());

    for (const key in agrupados) {
      const [motorista, loja, data] = key.split("|");
      const quantidade = agrupados[key].length;

      if (filtro.motorista && !motorista.toLowerCase().includes(filtro.motorista.toLowerCase())) continue;
      if (filtro.loja && !loja.includes(filtro.loja)) continue;
      if (filtro.data && !data.includes(filtro.data)) continue;

      const div = document.createElement("div");
      div.classList.add("coleta-item");
      div.innerHTML = `<strong>${motorista}</strong> - Loja: ${loja} - ${data} - Pedidos: ${quantidade}`;
      div.onclick = () => mostrarPedidosDetalhes(agrupados[key]);
      historicoLista.appendChild(div);
    }
  }

  window.aplicarFiltro = () => {
    const filtro = {
      motorista: document.getElementById("filtro-motorista").value,
      loja: document.getElementById("filtro-loja").value,
      data: document.getElementById("filtro-data").value
    };
    renderListaFiltrada(filtro);
  }

  // Renderiza sem filtro inicialmente
  renderListaFiltrada({});
}

function mostrarPedidosDetalhes(codigos) {
  const detalhes = document.getElementById("pedidos-detalhes");
  const lista = document.getElementById("pedidos-lista");
  lista.innerHTML = "";

  codigos.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    lista.appendChild(li);
  });

  // Botão de copiar
  const btnCopiar = document.createElement("button");
  btnCopiar.textContent = "📋 Copiar todos os pedidos";
  btnCopiar.onclick = () => {
    const texto = codigos.join("\n");
    navigator.clipboard.writeText(texto);
    alert("Pedidos copiados!");
  }

  // Remove antigo se existir
  const antigo = document.getElementById("copiar-btn");
  if (antigo) antigo.remove();
  btnCopiar.id = "copiar-btn";
  detalhes.appendChild(btnCopiar);

  detalhes.classList.remove("hidden");
}

function fecharHistorico() {
  document.getElementById("historico-page").classList.add("hidden");
  document.getElementById("main-page").classList.remove("hidden");
  document.getElementById("pedidos-detalhes").classList.add("hidden");
}
