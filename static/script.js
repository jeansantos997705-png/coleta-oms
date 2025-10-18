const codigoInput = document.getElementById("codigo");
const motoristaInput = document.getElementById("motorista");
const lojaInput = document.getElementById("loja");
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const registrarBtn = document.getElementById("registrar");
const adicionarBtn = document.getElementById("adicionar");
const historicoBtn = document.getElementById("btnHistorico");
const voltarBtn = document.getElementById("voltar");
const bipagem = document.getElementById("bipagem");
const historico = document.getElementById("historico");
const listaHistorico = document.getElementById("listaHistorico");

let pedidos = [];

function atualizarLista() {
    lista.innerHTML = "";
    pedidos.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        lista.appendChild(li);
    });
    contador.textContent = pedidos.length;
}

function adicionarPedido() {
    const codigo = codigoInput.value.trim();
    if (codigo.length !== 12) {
        alert("O código deve ter 12 caracteres!");
        return;
    }
    if (pedidos.includes(codigo)) {
        alert("Pedido duplicado!");
        return;
    }
    pedidos.push(codigo);
    codigoInput.value = "";
    atualizarLista();
}

codigoInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        adicionarPedido();
    }
});

adicionarBtn.addEventListener("click", adicionarPedido);

registrarBtn.addEventListener("click", async () => {
    const motorista = motoristaInput.value.trim();
    const loja = lojaInput.value.trim();

    if (!motorista || !loja || pedidos.length === 0) {
        alert("Preencha todos os campos e adicione pedidos!");
        return;
    }

    const resposta = await fetch("/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, pedidos })
    });

    const data = await resposta.json();
    alert(data.mensagem || "Erro ao salvar!");
    pedidos = [];
    atualizarLista();
});

historicoBtn.addEventListener("click", async () => {
    bipagem.classList.add("oculto");
    historico.classList.remove("oculto");
    listaHistorico.innerHTML = "<p>Carregando...</p>";

    const resposta = await fetch("/historico");
    const registros = await resposta.json();

    listaHistorico.innerHTML = "";
    registros.forEach(r => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${r.motorista}</b> - ${r.loja}<br><small>${r.data}</small>`;
        div.onclick = () => abrirDetalhes(r.id);
        listaHistorico.appendChild(div);
    });
});

voltarBtn.addEventListener("click", () => {
    historico.classList.add("oculto");
    bipagem.classList.remove("oculto");
});

async function abrirDetalhes(id) {
    const resposta = await fetch(`/historico/${id}`);
    const detalhes = await resposta.json();

    listaHistorico.innerHTML = `
        <h3>${detalhes.motorista} - ${detalhes.loja}</h3>
        <p>${detalhes.data}</p>
        <ul>${detalhes.pedidos.map(p => `<li>${p}</li>`).join('')}</ul>
        <button onclick="copiarPedidos(${id})">📋 Copiar todos</button>
        <button id="voltarHistorico">⬅️ Voltar</button>
    `;

    document.getElementById("voltarHistorico").onclick = () => historicoBtn.click();
}

async function copiarPedidos(id) {
    const resposta = await fetch(`/historico/${id}`);
    const detalhes = await resposta.json();
    const texto = detalhes.pedidos.join("\n");
    navigator.clipboard.writeText(texto);
    alert("Pedidos copiados!");
}
