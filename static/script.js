let bipagemAtual = [];

function atualizarListaBipagem() {
    const lista = document.getElementById("bipagemAtual");
    lista.innerHTML = "";
    bipagemAtual.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        lista.appendChild(li);
    });
    document.getElementById("contador").innerText = bipagemAtual.length;
}

function adicionarCodigo() {
    const codigoInput = document.getElementById("codigo");
    const codigo = codigoInput.value.trim();
    const msg = document.getElementById("mensagem");

    if (!codigo) {
        msg.innerText = "Digite ou bip um código!";
        return;
    }

    if (codigo.length !== 12 || codigo[9] !== '-') { // Exemplo: 12 caracteres com traço na posição 10
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
    msg.innerText = `Código ${codigo} adicionado na bipagem atual.`;
    codigoInput.value = "";
    atualizarListaBipagem();
}

// Permite adicionar o código ao pressionar Enter
document.getElementById("codigo").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        adicionarCodigo();
    }
});

async function registrarBipagem() {
    const motorista = document.getElementById("motorista").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const msg = document.getElementById("mensagem");

    if (!motorista || !loja) {
        msg.innerText = "Selecione o motorista e informe a loja!";
        return;
    }

    if (bipagemAtual.length === 0) {
        msg.innerText = "Nenhum código na bipagem atual!";
        return;
    }

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

// Funções placeholder
function abrirHistorico() {
    alert("Aqui abrirá o histórico de coletas.");
}

function exportarBackup() {
    alert("Aqui você exporta o backup em Excel.");
}
