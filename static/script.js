document.addEventListener("DOMContentLoaded", () => {
    const pedidoInput = document.getElementById("pedido");
    const adicionarBtn = document.getElementById("adicionar");
    const lista = document.getElementById("lista");
    const contador = document.getElementById("contador");
    const registrarBtn = document.getElementById("registrar");
    const motorista = document.getElementById("motorista");
    const loja = document.getElementById("loja");
    const historicoBtn = document.getElementById("abrirMenu");
    const paginaHistorico = document.getElementById("paginaHistorico");
    const voltarBtn = document.getElementById("voltar");
    const historicoUl = document.getElementById("historico");
    const backupBtn = document.getElementById("backup");

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

    adicionarBtn.addEventListener("click", () => {
        const codigo = pedidoInput.value.trim();
        if (codigo.length !== 12) {
            alert("O código deve ter 12 dígitos!");
            return;
        }
        if (pedidos.includes(codigo)) {
            alert("Esse código já foi bipado!");
            return;
        }
        pedidos.push(codigo);
        atualizarLista();
        pedidoInput.value = "";
        pedidoInput.focus();
    });

    pedidoInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            adicionarBtn.click();
        }
    });

    registrarBtn.addEventListener("click", async () => {
        if (!motorista.value || !loja.value || pedidos.length === 0) {
            alert("Preencha todos os campos e adicione pedidos!");
            return;
        }

        const res = await fetch("/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motorista: motorista.value, loja: loja.value, pedidos })
        });

        if (res.ok) {
            alert("Coleta registrada com sucesso!");
            pedidos = [];
            atualizarLista();
        } else {
            alert("Erro ao registrar coleta!");
        }
    });

    historicoBtn.addEventListener("click", async () => {
        const res = await fetch("/historico");
        const data = await res.json();

        paginaHistorico.classList.remove("hidden");
        historicoUl.innerHTML = "";

        data.forEach(reg => {
            const li = document.createElement("li");
            li.textContent = `${reg.motorista} - ${reg.loja} (${reg.data})`;
            li.addEventListener("click", async () => {
                const res2 = await fetch(`/detalhes/${reg.id}`);
                const detalhes = await res2.json();
                const pedidosTexto = detalhes.pedidos.join("\n");
                navigator.clipboard.writeText(pedidosTexto);
                alert("Pedidos copiados!");
            });
            historicoUl.appendChild(li);
        });
    });

    voltarBtn.addEventListener("click", () => {
        paginaHistorico.classList.add("hidden");
    });

    // 📦 Botão de Backup
    backupBtn.addEventListener("click", () => {
        window.location.href = "/backup";
    });
});
