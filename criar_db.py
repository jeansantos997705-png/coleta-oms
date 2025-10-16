import sqlite3

# Cria o banco de dados e a tabela se não existir
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        motorista TEXT NOT NULL,
        loja TEXT NOT NULL,
        codigo TEXT NOT NULL,
        data_hora TEXT NOT NULL
    )
''')

conn.commit()
conn.close()
print("✅ Banco de dados 'database.db' criado com sucesso!")
