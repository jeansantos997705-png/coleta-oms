from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

DB_FILE = "coletas.db"

# Criação da tabela caso não exista
def criar_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT,
            loja TEXT,
            motorista TEXT,
            data TEXT
        )
    ''')
    conn.commit()
    conn.close()

criar_db()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/registrar", methods=["POST"])
def registrar():
    dados = request.get_json()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    for item in dados:
        c.execute("INSERT INTO registros (codigo, loja, motorista, data) VALUES (?, ?, ?, ?)",
                  (item["codigo"], item["loja"], item["motorista"], datetime.now().strftime("%Y-%m-%d %H:%M")))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": f"{len(dados)} pedidos registrados com sucesso!"})

@app.route("/listar")
def listar():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT codigo, loja, motorista, data FROM registros ORDER BY id DESC")
    linhas = c.fetchall()
    conn.close()
    resultado = [{"codigo": l[0], "loja": l[1], "motorista": l[2], "data": l[3]} for l in linhas]
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
