from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
import pandas as pd
import os

app = Flask(__name__)

# Lista de coletas registradas
coletas = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/registrar", methods=["POST"])
def registrar():
    data = request.get_json()
    motorista = data.get("motorista")
    loja = data.get("loja")
    codigos = data.get("codigos", [])

    if not motorista or not loja or not codigos:
        return jsonify({"mensagem": "Dados incompletos!"})

    coleta = {
        "motorista": motorista,
        "loja": loja,
        "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "codigos": codigos
    }
    coletas.append(coleta)

    return jsonify({"mensagem": f"Coleta registrada com sucesso! ({len(codigos)} pedidos)"})

@app.route("/listar")
def listar():
    # Retorna histórico resumido
    return jsonify(coletas)

@app.route("/backup")
def backup():
    if not coletas:
        return jsonify({"mensagem": "Sem coletas para exportar"}), 400

    df_rows = []
    for coleta in coletas:
        for c in coleta["codigos"]:
            df_rows.append({
                "Motorista": coleta["motorista"],
                "Loja": coleta["loja"],
                "Data/Hora": coleta["data"],
                "Código Pedido": c
            })

    df = pd.DataFrame(df_rows)

    backup_file = "backup_pedidos.xlsx"
    df.to_excel(backup_file, index=False)

    return send_file(backup_file, as_attachment=True)

if __name__ == "__main__":
    # Para rodar no Render ou em qualquer servidor: host 0.0.0.0
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
