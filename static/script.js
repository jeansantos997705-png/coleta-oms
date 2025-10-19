const motoristaInput = document.getElementById("motorista");
const lojaInput = document.getElementById("loja");
const pedidoInput = document.getElementById("pedido");
const listaPedidos = document.getElementById("listaPedidos");
const contador = document.getElementById("contador");

let pedidos = [];

pedidoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        adicionarPedido();
    }
});

function adicionarPedido() {
    const motorista = motoristaInput.value.trim();
    const loja = lojaInput.value.trim();
    const pedido = pedidoInput.value.trim();

    if (!motorista || !loja || pedido.length !== 12) {
        alert("Preencha todos os campos corretamente (pedido = 12 dígitos).");
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

    contador.textContent = `Pedidos: ${pedidos.length}`;
    pedidoInput.value = "";
}

function enviar() {
    if (pedidos.length === 0) {
        alert("Nenhum pedido adicionado!");
        return;
    }

    fetch("/enviar", {
        method: "POST",
    }).then(() => {
        alert("Coleta enviada com sucesso!");
        pedidos = [];
        listaPedidos.innerHTML = "";
        contador.textContent = "Pedidos: 0";
    });
}
