from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS coletas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            motorista TEXT NOT NULL,
            loja TEXT NOT NULL,
            codigo TEXT NOT NULL UNIQUE,
            data TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos')

    if not motorista or not loja or not codigos:
        return jsonify({'mensagem': 'Preencha todos os campos!'})

    conn = get_db_connection()
    cur = conn.cursor()
    msg_geral = []

    for codigo in codigos:
        try:
            data_atual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cur.execute('INSERT INTO coletas (motorista, loja, codigo, data) VALUES (?, ?, ?, ?)',
                        (motorista, loja, codigo, data_atual))
            conn.commit()
            msg_geral.append(f'{codigo} registrado com sucesso.')
        except sqlite3.IntegrityError:
            msg_geral.append(f'{codigo} já existe no sistema.')

    conn.close()
    return jsonify({'mensagem': ' | '.join(msg_geral)})

@app.route('/listar')
def listar():
    conn = get_db_connection()
    coletas = conn.execute('SELECT * FROM coletas ORDER BY data DESC').fetchall()
    conn.close()
    result = []
    for row in coletas:
        # Agrupa códigos por motorista e loja
        existing = next((r for r in result if r['motorista']==row['motorista'] and r['loja']==row['loja'] and r['data']==row['data']), None)
        if existing:
            existing['codigos'].append(row['codigo'])
        else:
            result.append({'motorista': row['motorista'], 'loja': row['loja'], 'data': row['data'], 'codigos':[row['codigo']]})
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
