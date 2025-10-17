let codigosAtual = [];

const inputCodigo = document.getElementById("codigo");
inputCodigo.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        adicionarCodigo();
    }
});

function adicionarCodigo(){
    const codigo = document.getElementById("codigo").value.trim();
    const msg = document.getElementById("mensagem");

    if(codigo.length !== 12){
        msg.innerText = "Código inválido! Deve ter 12 caracteres (com traço).";
        return;
    }

    if(codigosAtual.includes(codigo)){
        msg.innerText = `Código ${codigo} já adicionado na coleta atual!`;
        return;
    }

    codigosAtual.push(codigo);
    atualizarColetaAtual();
    document.getElementById("codigo").value = "";
    msg.innerText = "";
}

function atualizarColetaAtual(){
    const lista = document.getElementById("coletaAtual");
    lista.innerHTML = "";
    codigosAtual.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        lista.appendChild(li);
    });
    document.getElementById("total").innerText = codigosAtual.length;
}

async function registrar(){
    const motorista = document.getElementById("motorista").value;
    const loja = document.getElementById("loja").value;
    const msg = document.getElementById("mensagem");

    if(!motorista || !loja || codigosAtual.length === 0){
        msg.innerText = "Preencha motorista, loja e adicione códigos!";
        return;
    }

    const resp = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorista, loja, codigos: codigosAtual })
    });

    const data = await resp.json();
    msg.innerText = data.mensagem.join(" | ");
    codigosAtual = [];
    atualizarColetaAtual();
    atualizarLista();
}

async function atualizarLista(){
    const resp = await fetch("/listar");
    const dados = await resp.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    dados.slice(0, 20).forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.motorista} - Loja ${item.loja}: ${item.codigo}`;
        lista.appendChild(li);
    });
}

setInterval(atualizarLista, 5000);
