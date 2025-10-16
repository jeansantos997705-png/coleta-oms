let bipagemAtual = [];

const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
const bipagemSection = document.getElementById("bipagem-atual-section");
const historicoSection = document.getElementById("historico-section");

menuBtn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});

function abrirBipagemAtual() {
    bipagemSection.classList.remove("oculto");
    historicoSection.classList.add("oculto");
    menu.style.display = "none";
}

function abrirHistorico() {
    historicoSection.classList.remove("oculto");
    bipagemSection.classList.add("oculto");
    menu.style.display = "none";
    atualizarHistorico();
}

document.getElementById("codigo").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        adicionarBipagem();
    }
});

function adicionarBipagem() {
    const codigoInput = document.getElementById("codigo");
    const codigo = codigoInput.value.trim();
    const msg = document.getElementById("mensagem");

    if (!codigo) {
        msg.innerText = "Digite ou bip o código!";
        return;
    }

    if (codigo.length !== 12 || !codigo.includes("-")) {
        msg.innerText = "Código inválido! Deve ter 12 caracteres incluindo o traço.";
        codigoInput.value = "";
        return;
    }

    if (bipagemAtual.includes(codigo)) {
        msg.innerText = `Código ${codigo} já foi bipado nesta coleta!`;
        codigoInput.value = "";
        return;
    }

    bipagemAtual.push(codigo);
    atualizarListaAtual();
    msg.innerText = `Código ${codigo} adicionado.`;
    codigoInput.value = "";
}

function atualizarListaAtual() {
    const lista = document.getElementById("lista-atual");
    lista.innerHTML = "";
    bipagemAtual.forEach((codigo) => {
        const li = document.createElement("li");
        li.textContent = codigo;
        lista.appendChild(li);
    });
    document.getElementById("contagem").innerText = bipagemAtual.length;
}

async function registrar() {
    const motorista = document.getElementById("motorista").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const msg = document.getElementById("mensagem");

    if (!motorista || !loja) {
        msg.innerText = "Selecione o motorista e preencha a loja!";
        return;
    }

    if (bipagemAtual.length === 0) {
        msg.innerText = "Nenhum código para registrar!";
        return;
    }

    const resp = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, codigos: bipagemAtual }),
    });

    const data = await resp.json();
    msg.innerText = data.mensagem;

    bipagemAtual = [];
    atualizarListaAtual();
    atualizarHistorico();
}

async function atualizarHistorico() {
    const resp = await fetch("/listar");
    const dados = await resp.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    dados.slice(0, 10).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.motorista} - Loja: ${item.loja} (${item.codigos.length} pedidos)`;
        lista.appendChild(li);
    });
}

setInterval(() => {
    if (!historicoSection.classList.contains("oculto")) {
        atualizarHistorico();
    }
}, 3000);
