const pedidoInput = document.getElementById("pedido");
const motoristaSelect = document.getElementById("motorista");
const lojaInput = document.getElementById("loja");
const adicionarBtn = document.getElementById("adicionar");
const enviarBtn = document.getElementById("enviar");
const contador = document.getElementById("contador");
const listaPedidos = document.getElementById("listaPedidos");
const listaRegistros = document.getElementById("listaRegistros");
const paginaColeta = document.getElementById("paginaColeta");
const paginaRegistros = document.getElementById("paginaRegistros");
const btnRegistros = document.getElementById("btnRegistros");
const btnVoltar = document.getElementById("btnVoltar");
const btnBackup = document.getElementById("btnBackup");
const detalhesDiv = document.getElementById("detalhes");
const listaDetalhes = document.getElementById("listaDetalhes");
const copiarBtn = document.getElementById("copiarPedidos");

let pedidos = [];

function atualizarContador() {
    contador.textContent = `Pedidos: ${pedidos.length}`;
}

function adicionarPedido() {
    const pedido = pedidoInput.value.trim();

    if (pedido.length !== 12) {
        alert("O código deve ter 12 caracteres!");
        return;
    }
    if (pedidos.includes(pedido)) {
        alert("Pedido duplicado!");
        return;
    }
    pedidos.push(pedido);
    const li = document.createElement("li");
    li.textContent = pedido;
    listaPedidos.appendChild(li);
    pedidoInput.value = "";
    atualizarContador();
}

pedidoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        adicionarPedido();
    }
});

adicionarBtn.addEventListener("click", adicionarPedido);

enviarBtn.addEventListener("click", async () => {
    const motorista = motoristaSelect.value;
    const loja = lojaInput.value.trim();

    if (!motorista || !loja || pedidos.length === 0) {
        alert("Preencha todos os campos antes de enviar!");
        return;
    }

    const response = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, pedidos }),
    });

    const data = await response.json();
    alert(data.message);
    pedidos = [];
    listaPedidos.innerHTML = "";
    atualizarContador();
});

btnRegistros.addEventListener("click", async () => {
    paginaColeta.classList.add("oculto");
    paginaRegistros.classList.remove("oculto");
    carregarHistorico();
});

btnVoltar.addEventListener("click", () => {
    paginaRegistros.classList.add("oculto");
    paginaColeta.classList.remove("oculto");
    detalhesDiv.classList.add("oculto");
});

async function carregarHistorico() {
    const response = await fetch("/historico");
    const data = await response.json();

    listaRegistros.innerHTML = "";
    data.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.motorista} - ${item.loja} (${item.data}) • ${item.quantidade} pedidos`;
        li.addEventListener("click", () => abrirDetalhes(item.id));
        listaRegistros.appendChild(li);
    });
}

async function abrirDetalhes(id) {
    const response = await fetch(`/detalhes/${id}`);
    const data = await response.json();

    detalhesDiv.classList.remove("oculto");
    listaDetalhes.innerHTML = "";
    data.pedidos.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = p;
        listaDetalhes.appendChild(li);
    });

    copiarBtn.onclick = () => {
        navigator.clipboard.writeText(data.pedidos.join("\n"));
        alert("Pedidos copiados!");
    };
}

btnBackup.addEventListener("click", () => {
    window.location.href = "/backup";
});
