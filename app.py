from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv
import os
import pandas as pd
from io import BytesIO

# --- Carrega variáveis do .env ---
load_dotenv()

app = Flask(__name__)

# --- Configura banco de dados ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Tabela de coletas ---
class Coleta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(12), unique=True, nullable=False)
    motorista = db.Column(db.String(50), nullable=False)
    loja = db.Column(db.String(20), nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)

# --- Inicializa banco (cria tabelas) ---
with app.app_context():
    db.create_all()

# --- Página inicial ---
@app.route('/')
def index():
    motoristas = [
        "Silenildo", "Adryen", "Priscila", "Uelber", 
        "Luiz Carlos", "Luis Gerson", "Marcio", "Dayveson", "Dalvan"
    ]
    return render_template('index.html', motoristas=motoristas)

# --- Registrar pedidos (somente após confirmação) ---
@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    codigos = data.get('codigos')  # Lista de códigos bipados

    if not motorista or not loja or not codigos:
        return jsonify({'status': 'erro', 'mensagem': 'Preencha todos os campos e bipes pelo menos um código!'})

    mensagens = []
    for codigo in codigos:
        # Validação: 12 caracteres com traço
        if len(codigo) != 12 or '-' not in codigo:
            mensagens.append(f"Código {codigo} inválido!")
            continue

        # Verifica duplicidade
        existente = Coleta.query.filter_by(codigo=codigo).first()
        if existente:
            mensagens.append(f"Código {codigo} já registrado!")
            continue

        # Grava no banco
        nova = Coleta(codigo=codigo, motorista=motorista, loja=loja)
        db.session.add(nova)
        mensagens.append(f"Código {codigo} registrado com sucesso!")

    db.session.commit()
    return jsonify({'status': 'ok', 'mensagens': mensagens})

# --- Listar últimos registros ---
@app.route('/listar')
def listar():
    coletas = Coleta.query.order_by(Coleta.data.desc()).limit(100).all()
    return jsonify([{
        'id': c.id,
        'codigo': c.codigo,
        'motorista': c.motorista,
        'loja': c.loja,
        'data': c.data.strftime('%Y-%m-%d %H:%M')
    } for c in coletas])

# --- Backup Excel ---
@app.route('/backup')
def backup():
    coletas = Coleta.query.order_by(Coleta.data.desc()).all()
    df = pd.DataFrame([{
        'ID': c.id,
        'Código': c.codigo,
        'Motorista': c.motorista,
        'Loja': c.loja,
        'Data': c.data.strftime('%Y-%m-%d %H:%M')
    } for c in coletas])

    output = BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)

    return send_file(output, download_name="backup_coletas.xlsx", as_attachment=True)

# --- Histórico detalhado ---
@app.route('/historico')
def historico():
    return render_template('historico.html')

# --- API para histórico filtrado ---
@app.route('/historico/listar', methods=['GET'])
def historico_listar():
    motorista = request.args.get('motorista')
    loja = request.args.get('loja')
    data_str = request.args.get('data')

    query = Coleta.query

    if motorista:
        query = query.filter_by(motorista=motorista)
    if loja:
        query = query.filter_by(loja=loja)
    if data_str:
        try:
            data = datetime.strptime(data_str, "%Y-%m-%d")
            query = query.filter(
                db.func.date(Coleta.data) == data.date()
            )
        except:
            pass

    coletas = query.order_by(Coleta.data.desc()).all()
    resultado = {}
    for c in coletas:
        key = f"{c.motorista} | {c.loja} | {c.data.strftime('%Y-%m-%d %H:%M')}"
        if key not in resultado:
            resultado[key] = []
        resultado[key].append(c.codigo)

    return jsonify(resultado)

# --- Rodar aplicação ---
if __name__ == '__main__':
    # Para testes locais
    app.run(host='0.0.0.0', port=5000, debug=True)
