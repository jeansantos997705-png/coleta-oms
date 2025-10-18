from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Banco de dados local (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coletas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Coleta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    motorista = db.Column(db.String(100), nullable=False)
    loja = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(20), nullable=False)
    pedidos = db.Column(db.Text, nullable=False)


with app.app_context():
    db.create_all()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/salvar', methods=['POST'])
def salvar():
    data = request.get_json()
    motorista = data.get('motorista')
    loja = data.get('loja')
    pedidos = data.get('pedidos', [])
    data_atual = datetime.now().strftime("%d/%m/%Y %H:%M")

    if not motorista or not loja or not pedidos:
        return jsonify({"erro": "Campos obrigatórios faltando"}), 400

    nova_coleta = Coleta(
        motorista=motorista,
        loja=loja,
        data=data_atual,
        pedidos=",".join(pedidos)
    )
    db.session.add(nova_coleta)
    db.session.commit()
    return jsonify({"mensagem": "Registro salvo com sucesso!"})


@app.route('/historico')
def historico():
    coletas = Coleta.query.order_by(Coleta.id.desc()).all()
    registros = [
        {"id": c.id, "motorista": c.motorista, "loja": c.loja, "data": c.data}
        for c in coletas
    ]
    return jsonify(registros)


@app.route('/historico/<int:id>')
def detalhes(id):
    coleta = Coleta.query.get_or_404(id)
    return jsonify({
        "motorista": coleta.motorista,
        "loja": coleta.loja,
        "data": coleta.data,
        "pedidos": coleta.pedidos.split(',')
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
