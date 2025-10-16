from flask import Flask, render_template, request, jsonify
import psycopg2
from datetime import datetime

app = Flask(__name__)

# --- Conexão com o banco Neon ---
def get_db_connection():
    conn = psycopg2.connect(
        "postgresql://neondb_owner:npg_2KY9maNofGWO@ep-nameless-art-adgk8l8m-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )
    return conn

# --- Página inicial ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Registrar bipagem ---
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    codigo = data.get('codigo')
    motorista = data.get('motorista')
    loja = data.get('loja')

    if not codigo or not motorista or not loja:
        return jsonify({'status': 'erro', 'mensagem': 'Preencha motorista, loja e código!'})

    conn = get_db_connection()
    cur = conn.cursor()

    # Verifica duplicidade
    cur.execute('SELECT * FROM coletas WHERE codigo = %s', (codigo,))
    existente = cur.fetchone()
    if existente:
        conn.close()
        return jsonify({'status': 'duplicado', 'mensagem': f'Código {codigo} já registrado!'})

    # Grava novo código
    data_atual = datetime.now()
    cur.execute('INSERT INTO coletas (codigo, motorista, loja, data) VALUES (%s, %s, %s, %s)',
                (codigo, motorista, loja, data_atual))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok', 'mensagem': f'Código {codigo} registrado com sucesso!'})

# --- Histórico com filtros ---
@app.route('/historico', methods=['GET'])
def historico():
    motorista = request.args.get("motorista")
    loja = request.args.get("loja")
    data = request.args.get("data")

    conn = get_db_connection()
    cur = conn.cursor()
    
    query = "SELECT id, codigo, motorista, loja, data FROM coletas WHERE 1=1"
    params = []

    if motorista:
        query += " AND motorista = %s"
        params.append(motorista)
    if loja:
        query += " AND loja = %s"
        params.append(loja)
    if data:
        query += " AND data::date = %s"
        params.append(data)

    query += " ORDER BY data DESC"
    cur.execute(query, params)
    registros = cur.fetchall()
    conn.close()

    resultado = [
        {
            "id": r[0],
            "codigo": r[1],
            "motorista": r[2],
            "loja": r[3],
            "data": r[4].strftime("%Y-%m-%d %H:%M")
        }
        for r in registros
    ]
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
