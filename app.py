from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

# Garante que o banco fique salvo na pasta atual
DB_PATH = os.path.join(os.path.dirname(__file__), 'data.db')

# Cria o banco se não existir
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                motorista TEXT,
                loja TEXT,
                codigo TEXT,
                data TEXT
            )
        ''')
        conn.commit()

init_db()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos', [])

    if not motorista or not loja or not codigos:
        return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos'})

    data_registro = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        for codigo in codigos:
            cursor.execute(
                'INSERT INTO pedidos (motorista, loja, codigo, data) VALUES (?, ?, ?, ?)',
                (motorista, loja, codigo, data_registro)
            )
        conn.commit()

    return jsonify({'status': 'sucesso', 'mensagem': 'Pedidos registrados com sucesso!'})


@app.route('/historico')
def historico():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT motorista, loja, data, COUNT(codigo) FROM pedidos GROUP BY motorista, loja, data ORDER BY id DESC')
        registros = cursor.fetchall()
    return jsonify(registros)


@app.route('/detalhes', methods=['POST'])
def detalhes():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    data_pedido = data.get('data')

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT codigo FROM pedidos WHERE motorista=? AND loja=? AND data=?', (motorista, loja, data_pedido))
        codigos = [row[0] for row in cursor.fetchall()]

    return jsonify(codigos)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
