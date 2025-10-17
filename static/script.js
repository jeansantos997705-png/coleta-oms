let bipagemAtual = [];

document.getElementById("addBtn").addEventListener("click", adicionarCodigo);
document.getElementById("codigo").addEventListener("keypress", function(e) {
    if(e.key === 'Enter') adicionarCodigo();
});

function adicionarCodigo() {
    const codigoInput = document.getElementById("codigo");
    const codigo = codigoInput.value.trim();
    const loja = document.getElementById("loja").value.trim();
    const motorista = document.getElementById("motorista").value;

    if (!codigo || !loja || !motorista) {
        alert("Preencha todos os campos!");
        return;
    }

    if (!/^.{12}$/.test(codigo)) {
        alert("O código deve ter 12 caracteres, incluindo o traço (-).");
        codigoInput.value = "";
        return;
    }

    bipagemAtual.push({codigo, loja, motorista});
    atualizarListaBipagem();
    codigoInput.value = "";
    codigoInput.focus();
}

function atualizarListaBipagem() {
    const lista = document.getElementById("lista-bipagem");
    lista.innerHTML = "";
    bipagemAtual.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.loja} - ${item.motorista}: ${item.codigo}`;
        lista.appendChild(li);
    });
    document.getElementById("contador").innerText = bipagemAtual.length;
}

async function registrar() {
    if(bipagemAtual.length === 0) return alert("Nenhum código para registrar!");
    const resp = await fetch("/registrar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bipagemAtual)
    });
    const data = await resp.json();
    alert(data.mensagem);
    bipagemAtual = [];
    atualizarListaBipagem();
    atualizarHistorico();
}

async function atualizarHistorico() {
    const resp = await fetch("/listar");
    const dados = await resp.json();
    const lista = document.getElementById("lista-historico");
    lista.innerHTML = "";
    dados.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.motorista} - Loja ${item.loja} (${item.codigo})`;
        lista.appendChild(li);
    });
}

document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("menu").classList.remove("hidden");
});

function fecharMenu() {
    document.getElementById("menu").classList.add("hidden");
}

function abrirHistorico() {
    document.getElementById("historico").classList.remove("hidden");
    fecharMenu();
    atualizarHistorico();
}
