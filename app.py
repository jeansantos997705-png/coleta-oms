import os
import sqlite3
from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
import pandas as pd
import io

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- DB helpers ---
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # coletas: cada sessão de coleta
    cur.execute('''
        CREATE TABLE IF NOT EXISTS coletas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            motorista TEXT NOT NULL,
            loja TEXT NOT NULL,
            data_hora TEXT NOT NULL
        )
    ''')
    # itens: cada codigo (pedido) ligado a uma coleta
    cur.execute('''
        CREATE TABLE IF NOT EXISTS itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coleta_id INTEGER NOT NULL,
            codigo TEXT NOT NULL UNIQUE,
            FOREIGN KEY (coleta_id) REFERENCES coletas(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ----------------------
# Routes
# ----------------------
@app.route('/')
def index():
    return render_template('index.html')

# Registrar múltiplos códigos (envia codigos array)
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json() or {}
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos') or data.get('codigos_lista') or data.get('codigos')  # support variations

    # também aceitar se for enviado um único código no campo 'codigos' como string
    if isinstance(codigos, str):
        codigos = [codigos]

    if not motorista or not loja or not codigos:
        return jsonify({'status': 'erro', 'mensagem': 'Preencha motorista, loja e adicione ao menos um código.'}), 400

    conn = get_conn()
    cur = conn.cursor()
    data_hora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    # cria a coleta
    cur.execute('INSERT INTO coletas (motorista, loja, data_hora) VALUES (?, ?, ?)', (motorista, loja, data_hora))
    coleta_id = cur.lastrowid

    mensagens = []
    inserted = 0
    for codigo in codigos:
        codigo_str = str(codigo).strip()
        if not codigo_str:
            continue
        # valida 12 caracteres com traço (posicional)
        if len(codigo_str) != 12 or '-' not in codigo_str:
            mensagens.append(f'{codigo_str} inválido')
            continue
        try:
            cur.execute('INSERT INTO itens (coleta_id, codigo) VALUES (?, ?)', (coleta_id, codigo_str))
            inserted += 1
        except sqlite3.IntegrityError:
            mensagens.append(f'{codigo_str} duplicado (já existe)')
    conn.commit()
    conn.close()

    msg = f'{inserted} pedidos registrados.'
    if mensagens:
        msg += ' Erros: ' + '; '.join(mensagens)
    return jsonify({'status': 'ok', 'mensagem': msg})

# Listar coletas agrupadas (para histórico). Suporta filtros por motorista, loja e data (YYYY-MM-DD).
@app.route('/listar', methods=['GET'])
def listar():
    motorista = request.args.get('motorista')
    loja = request.args.get('loja')
    data = request.args.get('data')  # YYYY-MM-DD

    conn = get_conn()
    cur = conn.cursor()

    # seleciona coletas e contagem de itens
    query = '''
        SELECT c.id, c.motorista, c.loja, c.data_hora, COUNT(i.id) as quantidade
        FROM coletas c
        LEFT JOIN itens i ON i.coleta_id = c.id
        WHERE 1=1
    '''
    params = []
    if motorista:
        query += ' AND c.motorista = ?'
        params.append(motorista)
    if loja:
        query += ' AND c.loja = ?'
        params.append(loja)
    if data:
        # filtro pela data (ignora horário)
        query += ' AND date(c.data_hora) = ?'
        params.append(data)

    query += ' GROUP BY c.id ORDER BY c.data_hora DESC LIMIT 500'
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    resultado = []
    for r in rows:
        resultado.append({
            'id': r['id'],
            'motorista': r['motorista'],
            'loja': r['loja'],
            'data': r['data_hora'],
            'quantidade': r['quantidade']
        })
    return jsonify(resultado)

# Detalhes de uma coleta: retorna todos os códigos daquela coleta
@app.route('/detalhes/<int:coleta_id>', methods=['GET'])
def detalhes(coleta_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT codigo FROM itens WHERE coleta_id = ? ORDER BY id ASC', (coleta_id,))
    rows = cur.fetchall()
    conn.close()
    codigos = [r['codigo'] for r in rows]
    return jsonify(codigos)

# Backup em Excel (todos os registros)
@app.route('/backup', methods=['GET'])
def backup():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT c.id as coleta_id, c.motorista, c.loja, c.data_hora, i.codigo
        FROM coletas c
        LEFT JOIN itens i ON i.coleta_id = c.id
        ORDER BY c.data_hora DESC, i.id ASC
    ''')
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return jsonify({'mensagem': 'Sem dados para exportar.'}), 400

    df_rows = []
    for r in rows:
        df_rows.append({
            'Coleta ID': r['coleta_id'],
            'Motorista': r['motorista'],
            'Loja': r['loja'],
            'Data/Hora': r['data_hora'],
            'Código': r['codigo']
        })

    df = pd.DataFrame(df_rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Coletas')
    output.seek(0)

    return send_file(output, as_attachment=True, download_name='backup_coletas.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

if __name__ == '__main__':
    # inicia app (Render enviará a PORT por env se necessário)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
