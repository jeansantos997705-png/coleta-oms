from flask import Flask, render_template, request, jsonify, send_file
import sqlite3
from datetime import datetime
import pandas as pd
import io

app = Flask(__name__)

# ------------------- Banco de dados -------------------
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

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

# ------------------- Página inicial -------------------
@app.route('/')
def index():
    return render_template('index.html')

# ------------------- Registrar múltiplos pedidos -------------------
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos')

    if not motorista or not loja or not codigos or len(codigos) == 0:
        return jsonify({'status':'erro', 'mensagem':'Preencha todos os campos e adicione pelo menos um código!'})

    data_atual = datetime.now().strftime('%Y-%m-%d %H:%M')
    conn = get_db_connection()
    cur = conn.cursor()
    mensagens = []

    for codigo in codigos:
        if len(codigo) != 12 or '-' not in codigo:
            mensagens.append(f"Código inválido: {codigo}")
            continue
        cur.execute('SELECT * FROM coletas WHERE codigo = ?', (codigo,))
        existente = cur.fetchone()
        if existente:
            mensagens.append(f"Código duplicado: {codigo}")
            continue
        cur.execute('INSERT INTO coletas (codigo, motorista, loja, data) VALUES (?, ?, ?, ?)',
                    (codigo, motorista, loja, data_atual))
    conn.commit()
    conn.close()

    if mensagens:
        return jsonify({'status':'parcial','mensagem':'\n'.join(mensagens)})
    return jsonify({'status':'ok','mensagem':'Coleta registrada com sucesso!'})

# ------------------- Histórico agrupado -------------------
@app.route('/historico')
def historico():
    conn = get_db_connection()
    coletas = conn.execute('''
        SELECT motorista, loja, data, COUNT(codigo) AS total
        FROM coletas
        GROUP BY motorista, loja, data
        ORDER BY data DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(row) for row in coletas])

# ------------------- Detalhes de uma coleta -------------------
@app.route('/detalhes')
def detalhes():
    motorista = request.args.get('motorista')
    loja = request.args.get('loja')
    data = request.args.get('data')

    conn = get_db_connection()
    coletas = conn.execute('''
        SELECT codigo FROM coletas
        WHERE motorista=? AND loja=? AND data=?
    ''', (motorista, loja, data)).fetchall()
    conn.close()
    return jsonify([row['codigo'] for row in coletas])

# ------------------- Backup em Excel -------------------
@app.route('/backup')
def backup():
    conn = get_db_connection()
    df = pd.read_sql_query('SELECT * FROM coletas', conn)
    conn.close()

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Coletas')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name='backup_coletas.xlsx')

# ------------------- Rodar o Flask -------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
