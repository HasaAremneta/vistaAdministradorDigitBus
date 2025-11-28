from flask import Flask, request, jsonify
import bcrypt
from db import get_connection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get('/')
def home():
    return "API de autenticación con Flask y SQL Server"

# ------------------------------------
#  Endpoint para registrar usuario
# ------------------------------------
@app.post('/register')
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username y password son obligatorios"}), 400

    # 🔐 Encriptar contraseña con bcrypt
    hashed_pass = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO USUARIOS (NOMBREUSUARIO, PASSWORD)
            VALUES (?, ?)
        """, (username, hashed_pass))

        conn.commit()
        return jsonify({"message": "Usuario registrado correctamente"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# ------------------------------------
#  Endpoint de login
# ------------------------------------
@app.post('/login')
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username y password son obligatorios"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # 🔎 Buscar el hash en la BD
    cursor.execute("SELECT PASSWORD, IS_ADMIN FROM USUARIOS WHERE NOMBREUSUARIO = ?", (username,))
    row = cursor.fetchone()

    stored_hash = row[0]
    is_admin = row[1]  # 0 o 1


    if not row:
        return jsonify({"error": "Usuario no encontrado"}), 404

    stored_hash = row[0]

    # 🔐 Comparar contraseña con bcrypt
    try:
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    except Exception:
        # fallback si stored_hash no es string
        is_valid = False

    if is_valid:
        return jsonify({
            "message": "Login exitoso",
            "is_admin": bool(is_admin)
        }), 200

    else:
        return jsonify({"error": "Credenciales incorrectas"}), 401


# ------------------------------------
#  Ejecutar servidor
# ------------------------------------
@app.get('/solicitudes')
def solicitudes():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Ejecutar la consulta
        cursor.execute("SELECT * FROM SOLICITUDES S INNER JOIN PERSONAL P ON P.IDPERSONAL = S.IDPERSONAL")
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "Sin solicitudes registradas"}), 404

        # Obtener nombres de columnas
        columns = [col[0] for col in cursor.description]

        # Convertir a lista de diccionarios
        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener solicitudes", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ------------------------------------
#  Ejecutar servidor
# ------------------------------------
if __name__ == '__main__':
    app.run(debug=True)
