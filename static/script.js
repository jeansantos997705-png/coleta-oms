let bipagemAtual = [];
const listaBipada = document.getElementById("listaBipada");
const mensagem = document.getElementById("mensagem");
const codigoInput = document.getElementById("codigo");
const motoristaInput = document.getElementById("motorista");
const lojaInput = document.getElementById("loja");

const menu = document.getElementById("menu");
const abrirMenuBtn = document.getElementById("abrirMenu");
const fecharMenuBtn = document.getElementById("fecharMenu");
const abrirHistoricoBtn = document.getElementById("abrirHistorico");
const exportarBackupBtn = document.getElementById("exportarBackup");

const paginaHistorico = document.getElementById("paginaHistorico");
const voltarMenuBtn = document.getElementById("voltarMenu");
const listaHistorico = document.getElementById("listaHistorico");
const detalhesColeta = document.getElementById("detalhesColeta");
const pedidosColeta = document.getElementById("pedidosColeta");
const copiarPedidosBtn = document.getElementById("copiarPedidos");
const fecharDetalhesBtn = document.getElementById("fecharDetalhes");

// --- Funções bipagem ---
document.getElementById("adicionar").onclick = () => {
    const codigo = codigoInput.value.trim();
    if (!codigo) return;
    bipagemAtual.push(codigo);
    atualizarListaBipada();
    codigoInput.value = "";
};

document.getElementById("registrar").onclick = async () => {
    const motorista = motoristaInput.value;
    const loja = lojaInput.value;
    if (!motorista || !loja || bipagemAtual.length === 0) {
        mensagem.innerText = "Preencha motorista, loja e adicione códigos!";
        return;
    }

    const resp = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, codigos: bipagemAtual }),
    });
    const data = await resp.json();
    mensagem.innerText = data.mensagem;
    bipagemAtual = [];
    atualizarListaBipada();
};

function atualizarListaBipada() {
    listaBipada.innerHTML = "";
    bipagemAtual.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        listaBipada.appendChild(li);
    });
}

// --- Menu ---
abrirMenuBtn.onclick = () => menu.classList.remove("oculto");
fecharMenuBtn.onclick = () => menu.classList.add("oculto");
abrirHistoricoBtn.onclick = () => {
    menu.classList.add("oculto");
    paginaHistorico.classList.remove("oculto");
    carregarHistorico();
};
voltarMenuBtn.onclick = () => paginaHistorico.classList.add("oculto");

// --- Histórico ---
async function carregarHistorico() {
    const resp = await fetch("/listar");
    const dados = await resp.json();
    listaHistorico.innerHTML = "";
    dados.slice().reverse().forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.motorista} - Loja: ${item.loja} (${item.codigos.length} pedidos)`;
        li.style.cursor = "pointer";
        li.onclick = () => abrirDetalhes(item);
        listaHistorico.appendChild(li);
    });
}

function abrirDetalhes(coleta) {
    detalhesColeta.classList.remove("oculto");
    pedidosColeta.innerHTML = "";
    coleta.codigos.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        pedidosColeta.appendChild(li);
    });
}

function fecharDetalhes() {
    detalhesColeta.classList.add("oculto");
}

copiarPedidosBtn.onclick = () => {
    const textos = Array.from(pedidosColeta.children).map(li => li.textContent).join("\n");
    navigator.clipboard.writeText(textos);
    alert("Pedidos copiados!");
};

exportarBackupBtn.onclick = async () => {
    const resp = await fetch("/backup");
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_pedidos.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
