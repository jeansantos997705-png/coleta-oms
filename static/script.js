let bipagemAtual = [];

async function adicionarCodigo() {
    const codigo = document.getElementById("codigo").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const motorista = document.getElementById("motorista").value.trim();
    const msg = document.getElementById("mensagem");

    if (!codigo || !loja || !motorista) {
        msg.innerText = "Preencha motorista, loja e código!";
        return;
    }

    if (codigo.length !== 12 || codigo[9] !== '-') { 
        msg.innerText = "Código inválido! Deve ter 12 caracteres com traço.";
        return;
    }

    if (bipagemAtual.includes(codigo)) {
        msg.innerText = `Código ${codigo} já adicionado nesta bipagem!`;
        return;
    }

    bipagemAtual.push(codigo);
    atualizarBipagemAtual();
    document.getElementById("codigo").value = "";
    document.getElementById("contador").innerText = bipagemAtual.length;
    msg.innerText = "";
}

function atualizarBipagemAtual() {
    const lista = document.getElementById("bipagemAtual");
    lista.innerHTML = "";
    bipagemAtual.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        lista.appendChild(li);
    });
}

async function registrarTudo() {
    const loja = document.getElementById("loja").value.trim();
    const motorista = document.getElementById("motorista").value.trim();
    const msg = document.getElementById("mensagem");

    if (!loja || !motorista || bipagemAtual.length === 0) {
        msg.innerText = "Preencha tudo e adicione pelo menos um código!";
        return;
    }

    for (const codigo of bipagemAtual) {
        await fetch("/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo, motorista, loja })
        });
    }

    bipagemAtual = [];
    atualizarBipagemAtual();
    document.getElementById("contador").innerText = 0;
    msg.innerText = "Todos os códigos registrados com sucesso!";
    atualizarHistorico();
}

// Menu e histórico
function abrirMenu() {
    document.getElementById("menu").style.display = "block";
}

function fecharMenu() {
    document.getElementById("menu").style.display = "none";
}

function abrirHistorico() {
    fecharMenu();
    document.getElementById("historicoSec").style.display = "block";
    atualizarHistorico();
}

function fecharHistorico() {
    document.getElementById("historicoSec").style.display = "none";
}

async function atualizarHistorico() {
    const resp = await fetch("/listar");
    const dados = await resp.json();
    const lista = document.getElementById("historicoLista");
    lista.innerHTML = "";
    dados.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.motorista} - Loja ${item.loja} - ${item.codigo}`;
        lista.appendChild(li);
    });
}

// Adiciona enter para adicionar código
document.getElementById("codigo").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        adicionarCodigo();
    }
});
