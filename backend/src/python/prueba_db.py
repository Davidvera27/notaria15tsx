import sqlite3
import os

def verificar_conexion_bd():
    # Ruta correcta a la base de datos
    DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../database/notaria15tsx.db"))

    print(f"Conectando a la base de datos en la ruta: {DB_PATH}")

    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Obtener las tablas disponibles en la base de datos
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        if tables:
            print(f"Tablas en la base de datos: {[table[0] for table in tables]}")
        else:
            print("No se encontraron tablas en la base de datos.")

        conn.close()
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")

if __name__ == "__main__":
    verificar_conexion_bd()
