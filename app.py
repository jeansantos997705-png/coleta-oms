from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file
from datetime import datetime
import csv
import os

app = Flask(__name__)

# Simulação de "banco de dados" na memória
registros = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/adicionar', methods=['POST'])
def adicionar():
    motorista = request.form['motorista']
    loja = request.form['loja']
    pedido = request.form['pedido']

    if len(pedido) != 12:
        return jsonify({"erro": "Código deve ter 12 caracteres."}), 400

    for r in registros:
        for p in r['pedidos']:
            if p == pedido:
                return jsonify({"erro": "Pedido duplicado."}), 400

    if not registros or registros[-1].get('finalizado', False):
        registros.append({
            "motorista": motorista,
            "loja": loja,
            "data": datetime.now().strftime("%d/%m/%Y"),
            "pedidos": [],
            "finalizado": False
        })

    registros[-1]["pedidos"].append(pedido)
    return jsonify({"sucesso": True, "total": len(registros[-1]['pedidos'])})

@app.route('/enviar', methods=['POST'])
def enviar():
    if registros:
        registros[-1]["finalizado"] = True
    return jsonify({"sucesso": True})

@app.route('/registros')
def ver_registros():
    return render_template('registros.html', registros=registros)

@app.route('/pedidos/<int:indice>')
def ver_pedidos(indice):
    return jsonify(registros[indice]["pedidos"])

@app.route('/backup')
def backup():
    arquivo_csv = "backup_coletas.csv"
    with open(arquivo_csv, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Motorista", "Loja", "Data", "Pedidos"])
        for r in registros:
            writer.writerow([r["motorista"], r["loja"], r["data"], ", ".join(r["pedidos"])])
    return send_file(arquivo_csv, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
