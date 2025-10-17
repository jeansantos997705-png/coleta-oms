let codigos = [];

// Atualiza contador
function atualizarContador() {
  document.getElementById('contador').textContent = codigos.length;
}

// Adiciona código
document.getElementById('addBtn').addEventListener('click', () => {
  const codigoInput = document.getElementById('codigo');
  const codigo = codigoInput.value.trim();
  if (codigo) {
    codigos.push(codigo);
    const li = document.createElement('li');
    li.textContent = codigo;
    document.getElementById('listaCodigos').appendChild(li);
    codigoInput.value = '';
    atualizarContador();
  }
});

// Enter adiciona também
document.getElementById('codigo').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.getElementById('addBtn').click();
  }
});

// Registrar pedidos
document.getElementById('registrarBtn').addEventListener('click', async () => {
  const motorista = document.getElementById('motorista').value.trim();
  const loja = document.getElementById('loja').value.trim();

  if (!motorista || !loja || codigos.length === 0) {
    alert('Preencha todos os campos e adicione ao menos um código.');
    return;
  }

  const res = await fetch('/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motorista, loja, codigos })
  });
  const data = await res.json();

  if (data.status === 'sucesso') {
    alert('Pedidos registrados!');
    codigos = [];
    document.getElementById('listaCodigos').innerHTML = '';
    atualizarContador();
  } else {
    alert('Erro ao registrar pedidos.');
  }
});

// Alternância de telas
const mainScreen = document.getElementById('mainScreen');
const menuScreen = document.getElementById('menuScreen');
const historicoScreen = document.getElementById('historicoScreen');

document.getElementById('menuBtn').onclick = () => {
  mainScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
};

document.getElementById('voltarBtn').onclick = () => {
  menuScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
};

// Histórico
document.getElementById('historicoBtn').onclick = async () => {
  menuScreen.classList.add('hidden');
  historicoScreen.classList.remove('hidden');

  const res = await fetch('/historico');
  const data = await res.json();

  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  if (data.length === 0) {
    lista.innerHTML = '<li>Nenhum registro encontrado</li>';
    return;
  }

  data.forEach(item => {
    const [motorista, loja, dataPedido, qtd] = item;
    const li = document.createElement('li');
    li.textContent = `${motorista} - ${loja} (${qtd} pedidos) em ${dataPedido}`;
    li.onclick = async () => {
      const resp = await fetch('/detalhes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motorista, loja, data: dataPedido })
      });
      const codigos = await resp.json();
      alert(`Códigos:\n${codigos.join('\n')}`);
    };
    lista.appendChild(li);
  });
};

document.getElementById('voltarMenuBtn').onclick = () => {
  historicoScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
};
