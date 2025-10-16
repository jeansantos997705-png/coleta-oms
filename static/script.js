let coletaAtual = [];

async function registrar() {
    const motorista = document.getElementById("motorista").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const msg = document.getElementById("mensagem");

    if (!motorista || !loja) {
        msg.innerText = "Preencha motorista e loja!";
        return;
    }

    if (coletaAtual.length === 0) {
        msg.innerText = "Nenhum código para registrar!";
        return;
    }

    // Enviar todos os códigos de uma vez
    const resp = await fetch("/registrar-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, codigos: coletaAtual })
    });

    const data = await resp.json();
    msg.innerText = data.mensagem;

    // Limpar coleta atual
    coletaAtual = [];
    atualizarListaAtual();
    document.getElementById("contador").innerText = 0;
}

function toggleMenu() {
    const menuContent = document.getElementById("menu-content");
    menuContent.style.display = menuContent.style.display === "block" ? "none" : "block";
}

function atualizarListaAtual() {
    const lista = document.getElementById("lista-atual");
    lista.innerHTML = "";
    coletaAtual.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        lista.appendChild(li);
    });
    document.getElementById("contador").innerText = coletaAtual.length;
}

document.getElementById("codigo").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        const codigo = this.value.trim();
        if (!codigo) return;

        if (coletaAtual.includes(codigo)) {
            alert("Código duplicado na coleta atual!");
        } else {
            coletaAtual.push(codigo);
            atualizarListaAtual();
        }
        this.value = "";
    }
});

// Histórico e backup (exemplo)
function abrirHistorico() {
    document.getElementById("historico").style.display = "block";
}

function fecharHistorico() {
    document.getElementById("historico").style.display = "none";
}

function filtrarHistorico() {
    // Função para filtrar histórico futuramente
}

function fazerBackup() {
    alert("Backup em Excel será implementado via servidor");
}
