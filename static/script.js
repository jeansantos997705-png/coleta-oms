let bipagemAtual = [];

// ===================== Menu =====================
function abrirMenu() {
  document.getElementById("menu").style.display = "block";
}

function fecharMenu() {
  document.getElementById("menu").style.display = "none";
}

// ===================== Bipagem =====================
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

function atualizarBipagemAtual() {
  const lista = document.getElementById("bipagemAtual");
  lista.innerHTML = "";
  bipagemAtual.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.codigo} (${item.loja})`;
    lista.appendChild(li);
  });
  document.getElementById("contador").innerText = bipagemAtual.length;
}

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

// ===================== Histórico =====================
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

function copiarPedidos(chave) {
  fetch(`/historico`).then(resp => resp.json()).then(data => {
    const pedidos = data[chave];
    navigator.clipboard.writeText(pedidos.join("\n")).then(() => {
      alert("Pedidos copiados!");
    });
  });
}

// ===================== Eventos =====================
document.getElementById("codigo").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    adicionarCodigo();
  }
});

window.addEventListener("load", carregarHistorico);
