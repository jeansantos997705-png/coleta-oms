let bipagemAtual = [];

// --- Bipagem ---
function atualizarListaBipagem() {
    const lista = document.getElementById("bipagemAtual");
    lista.innerHTML = "";
    bipagemAtual.forEach(codigo => {
        const li = document.createElement("li");
        li.textContent = codigo;
        lista.appendChild(li);
    });
    document.getElementById("contador").innerText = bipagemAtual.length;
}

function adicionarCodigo() {
    const codigoInput = document.getElementById("codigo");
    const codigo = codigoInput.value.trim();
    const msg = document.getElementById("mensagem");

    if (!codigo) { msg.innerText = "Digite ou bip um código!"; return; }
    if (codigo.length !== 12 || codigo[9] !== '-') {
        msg.innerText = "Código inválido! Deve ter 12 caracteres e incluir o traço.";
        codigoInput.value = "";
        return;
    }
    if (bipagemAtual.includes(codigo)) {
        msg.innerText = `Código ${codigo} já adicionado na bipagem atual!`;
        codigoInput.value = "";
        return;
    }

    bipagemAtual.push(codigo);
    msg.innerText = `Código ${codigo} adicionado.`;
    codigoInput.value = "";
    atualizarListaBipagem();
}

// Enter para adicionar
document.getElementById("codigo").addEventListener("keypress", e => {
    if (e.key === "Enter") adicionarCodigo();
});

async function registrarBipagem() {
    const motorista = document.getElementById("motorista").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const msg = document.getElementById("mensagem");

    if (!motorista || !loja) { msg.innerText = "Selecione o motorista e informe a loja!"; return; }
    if (bipagemAtual.length === 0) { msg.innerText = "Nenhum código na bipagem atual!"; return; }

    for (let codigo of bipagemAtual) {
        await fetch("/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motorista, loja, codigo }),
        });
    }

    bipagemAtual = [];
    atualizarListaBipagem();
    msg.innerText = "Bipagem registrada com sucesso!";
}

// --- Navegação de páginas ---
function abrirMenu() {
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
    document.getElementById("pagina-menu").classList.add("ativa");
}

function voltarBipagem() {
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
    document.getElementById("pagina-bipagem").classList.add("ativa");
}

function abrirHistorico() {
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
    document.getElementById("pagina-historico").classList.add("ativa");
    carregarHistorico();
}

function voltarMenu() {
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
    document.getElementById("pagina-menu").classList.add("ativa");
}

// --- Histórico (placeholder) ---
function carregarHistorico() {
    const lista = document.getElementById("historico-lista");
    lista.innerHTML = "<li>Carregando histórico...</li>";
}

function aplicarFiltros() {
    alert("Aqui aplicamos filtros de motorista, loja e data.");
}

// --- Backup (placeholder) ---
function exportarBackup() {
    alert("Aqui você exporta o backup em Excel.");
}
