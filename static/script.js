let bipagemAtual = [];

async function adicionarCodigo() {
  const motorista = document.getElementById("motorista").value;
  const loja = document.getElementById("loja").value;
  const codigoInput = document.getElementById("codigo");
  const codigo = codigoInput.value.trim();
  const msg = document.getElementById("mensagem");

  if (!motorista || !loja || !codigo) {
    msg.innerText = "Preencha todos os campos!";
    return;
  }

  // Bloqueio do tamanho do código
  if (codigo.length !== 12) {
    msg.innerText = "Código deve ter 12 caracteres (incluindo o traço).";
    return;
  }

  bipagemAtual.push({ motorista, loja, codigo });
  atualizarBipagemAtual();
  codigoInput.value = "";
  codigoInput.focus();
  msg.innerText = "";
}

// Atualiza a lista de bipagem atual
function atualizarBipagemAtual() {
  const lista = document.getElementById("bipagemAtual");
  lista.innerHTML = "";
  bipagemAtual.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.codigo} (${item.loja})`;
    lista.appendChild(li);
  });
  document.getElementById("contador").innerText = bipagemAtual.length;
}

// Registrar todos os códigos no banco
async function registrarTudo() {
  const msg = document.getElementById("mensagem");
  if (bipagemAtual.length === 0) {
    msg.innerText = "Nenhum código para registrar!";
    return;
  }

  for (let item of bipagemAtual) {
    await fetch("/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  }

  bipagemAtual = [];
  atualizarBipagemAtual();
  msg.innerText = "Bipagem registrada com sucesso!";
  carregarHistorico();
}

// Carrega o histórico do servidor
async function carregarHistorico() {
  const resp = await fetch("/historico");
  const data = await resp.json();
  const lista = document.getElementById("historicoLista");
  lista.innerHTML = "";

  for (let chave in data) {
    const pedidos = data[chave];
    const li = document.createElement("li");
    li.innerHTML = `<strong>${chave}</strong> - ${pedidos.length} pedidos
                    <button onclick="copiarPedidos('${chave}')">Copiar pedidos</button>`;
    lista.appendChild(li);
  }
}

// Copiar pedidos de uma coleta específica
function copiarPedidos(chave) {
  fetch(`/historico`).then(resp => resp.json()).then(data => {
    const pedidos = data[chave];
    navigator.clipboard.writeText(pedidos.join("\n")).then(() => {
      alert("Pedidos copiados!");
    });
  });
}

// Adiciona código ao pressionar Enter
document.getElementById("codigo").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    adicionarCodigo();
  }
});

// Atualiza o histórico ao carregar a página
window.addEventListener("load", carregarHistorico);
