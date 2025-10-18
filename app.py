from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coletas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Coleta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    motorista = db.Column(db.String(50))
    loja = db.Column(db.String(20))
    data = db.Column(db.String(20))
    hora = db.Column(db.String(10))
    pedidos = db.Column(db.Text)  # armazenar JSON como string

db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    motorista = data['motorista']
    loja = data['loja']
    pedidos = data['pedidos']
    now = datetime.now()
    nova_coleta = Coleta(
        motorista=motorista,
        loja=loja,
        data=now.strftime('%Y-%m-%d'),
        hora=now.strftime('%H:%M'),
        pedidos=','.join(pedidos)
    )
    db.session.add(nova_coleta)
    db.session.commit()
    return jsonify({'status':'ok'})

@app.route('/registro')
def registro():
    coletas = Coleta.query.order_by(Coleta.id.desc()).all()
    result = []
    for c in coletas:
        result.append({
            'motorista': c.motorista,
            'loja': c.loja,
            'data': c.data,
            'hora': c.hora,
            'pedidos': c.pedidos.split(',')
        })
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
