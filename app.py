from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
import os
import io
from datetime import datetime
import pandas as pd

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coletas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo de tabela
class Coleta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    motorista = db.Column(db.String(100))
    loja = db.Column(db.String(100))
    data = db.Column(db.String(20))
    pedidos = db.Column(db.Text)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    pedidos = ', '.join(data.get('pedidos', []))
    data_atual = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    nova_coleta = Coleta(motorista=motorista, loja=loja, data=data_atual, pedidos=pedidos)
    db.session.add(nova_coleta)
    db.session.commit()

    return jsonify({"message": "Coleta registrada com sucesso!"})

@app.route('/historico')
def historico():
    coletas = Coleta.query.order_by(Coleta.id.desc()).all()
    registros = []
    for coleta in coletas:
        registros.append({
            "id": coleta.id,
            "motorista": coleta.motorista,
            "loja": coleta.loja,
            "data": coleta.data
        })
    return jsonify(registros)

@app.route('/detalhes/<int:id>')
def detalhes(id):
    coleta = Coleta.query.get(id)
    if not coleta:
        return jsonify({"error": "Registro não encontrado"}), 404
    pedidos = coleta.pedidos.split(", ")
    return jsonify({"pedidos": pedidos})

# 🧩 NOVO: rota para gerar backup em Excel
@app.route('/backup', methods=['GET'])
def backup():
    coletas = Coleta.query.order_by(Coleta.id.desc()).all()

    if not coletas:
        return jsonify({"error": "Nenhum registro encontrado para backup"}), 404

    data = []
    for coleta in coletas:
        pedidos = coleta.pedidos.split(", ")
        for pedido in pedidos:
            data.append({
                "Motorista": coleta.motorista,
                "Loja": coleta.loja,
                "Data": coleta.data,
                "Pedido": pedido
            })

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Coletas')

    output.seek(0)
    return send_file(output, as_attachment=True, download_name="backup_coletas.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
