from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

DB_PATH = 'data.db'

# --- Função auxiliar para conectar ao banco ---
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- Cria a tabela se não existir ---
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS coletas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL UNIQUE,
            motorista TEXT NOT NULL,
            loja TEXT NOT NULL,
            data TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Página inicial ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Endpoint para registrar códigos ---
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos')  # lista de códigos

    if not motorista or not loja or not codigos:
        return jsonify({'status': 'erro', 'mensagem': 'Preencha motorista, loja e códigos!'})

    conn = get_db_connection()
    cur = conn.cursor()
    mensagens = []

    for codigo in codigos:
        # Verifica duplicidade
        cur.execute('SELECT * FROM coletas WHERE codigo = ?', (codigo,))
        existente = cur.fetchone()
        if existente:
            mensagens.append(f'Código {codigo} já registrado!')
            continue

        # Insere novo código
        data_atual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cur.execute('INSERT INTO coletas (codigo, motorista, loja, data) VALUES (?, ?, ?, ?)',
                    (codigo, motorista, loja, data_atual))
        mensagens.append(f'Código {codigo} registrado!')

    conn.commit()
    conn.close()
    return jsonify({'status': 'ok', 'mensagem': mensagens})

# --- Endpoint para listar registros ---
@app.route('/listar')
def listar():
    conn = get_db_connection()
    coletas = conn.execute('SELECT * FROM coletas ORDER BY data DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in coletas])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
