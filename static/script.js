const codigoInput = document.getElementById("codigo");
const motoristaSelect = document.getElementById("motorista");
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

// valida e atualiza UI
function atualizarLista() {
    lista.innerHTML = "";
    pedidos.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        lista.appendChild(li);
    });
    contador.textContent = pedidos.length;
}

// adicionar pedido (usado por botão e Enter)
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

// Enter para adicionar
codigoInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        adicionarPedido();
    }
});
adicionarBtn.addEventListener("click", adicionarPedido);

// registrar no servidor
registrarBtn.addEventListener("click", async () => {
    const motorista = motoristaSelect.value.trim();
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

    if (!resposta.ok) {
        const txt = await resposta.text();
        alert("Erro ao salvar: " + txt);
        return;
    }

    const data = await resposta.json();
    alert(data.mensagem || "Salvo com sucesso!");
    pedidos = [];
    atualizarLista();
});

// histórico
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
        <button id="copiarBtn">📋 Copiar todos</button>
        <button id="voltarHistorico">⬅️ Voltar</button>
    `;

    document.getElementById("copiarBtn").onclick = async () => {
        const resp = await fetch(`/historico/${id}`);
        const d = await resp.json();
        const texto = d.pedidos.join("\n");
        navigator.clipboard.writeText(texto);
        alert("Pedidos copiados!");
    };

    document.getElementById("voltarHistorico").onclick = () => {
        // reload histórico list
        historicoBtn.click();
    };
}
