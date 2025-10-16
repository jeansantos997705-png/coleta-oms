let bipagens = [];

function adicionarBipagem() {
    const codigoInput = document.getElementById("codigo");
    const motoristaInput = document.getElementById("motorista");
    const lojaInput = document.getElementById("loja");
    const msg = document.getElementById("mensagem");

    const codigo = codigoInput.value.trim();
    const motorista = motoristaInput.value.trim();
    const loja = lojaInput.value.trim();

    if (!codigo || !motorista || !loja) {
        msg.innerText = "Preencha motorista, loja e código!";
        return;
    }

    bipagens.push({codigo, motorista, loja});
    atualizarBipagemAtual();
    codigoInput.value = "";
    codigoInput.focus();
}

function atualizarBipagemAtual() {
    const lista = document.getElementById("bipagem-atual");
    lista.innerHTML = "";
    bipagens.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.codigo} - ${item.motorista} - Loja ${item.loja}`;
        lista.appendChild(li);
    });
    document.getElementById("contador").innerText = bipagens.length;
}

async function registrarBipagens() {
    const msg = document.getElementById("mensagem");
    for (let item of bipagens) {
        const resp = await fetch("/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        });
        const data = await resp.json();
        msg.innerText = data.mensagem;
    }
    bipagens = [];
    atualizarBipagemAtual();
}

// --- Menu ---
function abrirMenu() {
    document.getElementById("menu").classList.remove("menu-oculto");
}
function fecharMenu() {
    document.getElementById("menu").classList.add("menu-oculto");
}

// --- Histórico ---
function abrirHistorico() {
    fecharMenu();
    document.getElementById("historico-tela").classList.remove("menu-oculto");
}

function fecharHistorico() {
    document.getElementById("historico-tela").classList.add("menu-oculto");
}

async function filtrarHistorico() {
    const motorista = document.getElementById("filtro-motorista").value;
    const loja = document.getElementById("filtro-loja").value;
    const data = document.getElementById("filtro-data").value;

    let url = `/historico?`;
    if (motorista) url += `motorista=${motorista}&`;
    if (loja) url += `loja=${loja}&`;
    if (data) url += `data=${data}&`;

    const resp = await fetch(url);
    const registros = await resp.json();
    const lista = document.getElementById("lista-historico");
    lista.innerHTML = "";

    registros.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.data} - ${r.motorista} - Loja ${r.loja} - ${r.codigo}`;
        lista.appendChild(li);
    });
}
