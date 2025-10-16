let bipagens = [];

function adicionarBipagem() {
    const codigoInput = document.getElementById("codigo");
    const codigo = codigoInput.value.trim();
    const msg = document.getElementById("mensagem");

    if (!codigo) {
        msg.innerText = "Digite ou bipa um código!";
        return;
    }

    if (codigo.length !== 12 || !codigo.includes("-")) {
        msg.innerText = `Código ${codigo} inválido! Deve ter 12 caracteres com traço.`;
        return;
    }

    if (bipagens.includes(codigo)) {
        msg.innerText = `Código ${codigo} já adicionado nesta sessão!`;
        return;
    }

    bipagens.push(codigo);
    atualizarListaAtual();
    codigoInput.value = "";
    codigoInput.focus();
    msg.innerText = "";
}

function atualizarListaAtual() {
    const lista = document.getElementById("bipagemAtual");
    lista.innerHTML = "";
    bipagens.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        lista.appendChild(li);
    });
}

async function registrar() {
    const motorista = document.getElementById("motorista").value.trim();
    const loja = document.getElementById("loja").value.trim();
    const msg = document.getElementById("mensagem");

    if (!motorista || !loja) {
        msg.innerText = "Preencha motorista e loja!";
        return;
    }

    if (bipagens.length === 0) {
        msg.innerText = "Nenhum código bipado!";
        return;
    }

    const resp = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, codigos: bipagens })
    });

    const data = await resp.json();
    msg.innerHTML = data.mensagens.join("<br>");
    bipagens = [];
    atualizarListaAtual();
}

function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function baixarBackup() {
    window.location.href = "/backup";
}
