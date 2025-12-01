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
#  Endpoint para usuarios

@app.post('/register')
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username y password son obligatorios"}), 400

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


@app.get('/users')
def get_users():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT IDUSUARIOS, NOMBREUSUARIO FROM USUARIOS WHERE IS_ADMIN = 0")
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "No hay usuarios registrados"}), 404

        columns = [col[0] for col in cursor.description]

        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.put('/users/update/<int:user_id>')
def update_user(user_id):
    data = request.get_json()

    nombre = data.get("nombre")
    apellido_p = data.get("apellido_paterno")
    apellido_m = data.get("apellido_materno")
    nombre_usuario = data.get("nombre_usuario")
    correo = data.get("correo")
    nueva_password = data.get("password") 

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Buscar al usuario del sistema (USUARIOS) por IDUSUARIOS
        cursor.execute("""
            SELECT IDUSUARIOS, NOMBREUSUARIO 
            FROM USUARIOS 
            WHERE IDUSUARIOS = ?
        """, (user_id,))
        usuario_row = cursor.fetchone()

        if not usuario_row:
            return jsonify({"error": "Usuario del sistema no encontrado"}), 404

        old_username = usuario_row[1]

        # Buscar el registro en PERSONAL ligado por el usuario viejo
        cursor.execute("""
            SELECT IDPERSONAL 
            FROM PERSONAL 
            WHERE NOMBREUSUARIO = ?
        """, (old_username,))
        personal_row = cursor.fetchone()

        if not personal_row:
            return jsonify({"error": "Registro de PERSONAL no encontrado para este usuario"}), 404

        id_personal = personal_row[0]

        # ACTUALIZAR PERSONAL
        cursor.execute("""
            UPDATE PERSONAL
            SET 
                NOMBRE = ?, 
                APELLIDOPATERNO = ?, 
                APELLIDOMATERNO = ?, 
                NOMBREUSUARIO = ?, 
                CORREO = ?
            WHERE IDPERSONAL = ?
        """, (nombre, apellido_p, apellido_m, nombre_usuario, correo, id_personal))

        # ACTUALIZAR USUARIOS
        if nueva_password:
            hashed_pass = bcrypt.hashpw(nueva_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("""
                UPDATE USUARIOS
                SET 
                    NOMBREUSUARIO = ?, 
                    PASSWORD = ?
                WHERE IDUSUARIOS = ?
            """, (nombre_usuario, hashed_pass, user_id))
        else:
            cursor.execute("""
                UPDATE USUARIOS
                SET 
                    NOMBREUSUARIO = ?
                WHERE IDUSUARIOS = ?
            """, (nombre_usuario, user_id))

        conn.commit()

        return jsonify({"message": "Usuario actualizado correctamente"}), 200

    except Exception as e:
        return jsonify({
            "error": "Error al actualizar usuario",
            "details": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()



@app.get('/users/admin')
def get_users_admin():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT IDUSUARIOS, NOMBREUSUARIO FROM USUARIOS WHERE IS_ADMIN = 1")
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "No hay usuarios registrados"}), 404

        columns = [col[0] for col in cursor.description]

        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.delete('/users/<int:user_id>')
def delete_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM USUARIOS WHERE IDUSUARIOS = ?", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify({"message": "Usuario eliminado correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al eliminar usuario", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.get('/users/<string:name>')
def get_user(name): 
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM PERSONAL WHERE NOMBREUSUARIO = ?", (name,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Usuario no encontrado"}), 404

        columns = [col[0] for col in cursor.description]

        user = dict(zip(columns, row))

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener usuario", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.get('/users/tarjetas')
def get_user_tarjetas():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM TARJETAS T INNER JOIN PERSONAL P ON P.IDPERSONAL = T.IDPERSONAL")
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "No hay tarjetas "}), 404

        columns = [col[0] for col in cursor.description]

        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener tarjetas", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.get('/users/tarjetas/<int:user_id>')
def get_user_tarjetasu(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM TARJETAS WHERE IDPERSONAL = ?", (user_id,))
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "No hay tarjetas asociadas a este usuario"}), 404

        columns = [col[0] for col in cursor.description]

        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener tarjetas", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.put('/users/tarjeta/<int:card_id>/deactivate')
def deactivate_card(card_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE TARJETAS SET STATUS = 'Inactiva' WHERE IDTARJETA = ?", (card_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Tarjeta no encontrada"}), 404

        return jsonify({"message": "Tarjeta desactivada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al desactivar tarjeta", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.put('/users/tarjeta/<int:card_id>/activate')
def activate_card(card_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE TARJETAS SET STATUS = 'activa' WHERE IDTARJETA = ?", (card_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Tarjeta no encontrada"}), 404

        return jsonify({"message": "Tarjeta activada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al activar tarjeta", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.post('/users/admin')
def create_users_admin():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username y password son obligatorios"}), 400

    hashed_pass = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT IDUSUARIOS FROM USUARIOS WHERE NOMBREUSUARIO = ?", (username,))
        if cursor.fetchone():
            return jsonify({"error": "El nombre de usuario ya existe"}), 409

        # Insertar usuario administrador (IS_ADMIN = 1)
        cursor.execute("""
            INSERT INTO USUARIOS (NOMBREUSUARIO, PASSWORD, IS_ADMIN)
            VALUES (?, ?, 1)
        """, (username, hashed_pass))

        conn.commit()
        return jsonify({"message": "Usuario administrador creado correctamente"}), 201

    except Exception as e:
        return jsonify({"error": "Error al crear usuario administrador", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# ------------------------------------
#  Endpoint de login
@app.post('/login')
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username y password son obligatorios"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT PASSWORD, IS_ADMIN FROM USUARIOS WHERE NOMBREUSUARIO = ?", (username,))
    row = cursor.fetchone()

    stored_hash = row[0]
    is_admin = row[1]  


    if not row:
        return jsonify({"error": "Usuario no encontrado"}), 404

    stored_hash = row[0]

    try:
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    except Exception:
        is_valid = False

    if is_valid:
        return jsonify({
            "message": "Login exitoso",
            "is_admin": bool(is_admin)
        }), 200

    else:
        return jsonify({"error": "Credenciales incorrectas"}), 401


# ------------------------------------
#  Endpoints Soliocitudes
@app.get('/solicitudes')
def solicitudes():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                S.*,
                P.*,
                D.TARJETAS,
                D.CONSTANCIA,
                D.VAUCHES
            FROM SOLICITUDES S
            INNER JOIN PERSONAL P ON P.IDPERSONAL = S.IDPERSONAL
            LEFT JOIN DOCUMENTACION D ON D.IDSOLICITUD = S.IDSOLICITUD
        """)
        
        rows_fetched = cursor.fetchall()

        if not rows_fetched:
            return jsonify({"error": "Sin solicitudes registradas"}), 404

        columns = [col[0] for col in cursor.description]

        rows = [dict(zip(columns, row)) for row in rows_fetched]

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener solicitudes", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.delete('/solicitudes/<int:solicitud_id>')
def delete_solicitud(solicitud_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM SOLICITUDES WHERE IDSOLICITUD = ?", (solicitud_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Solicitud no encontrada"}), 404

        return jsonify({"message": "Solicitud eliminada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al eliminar solicitud", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.put('/solicitudes/<int:solicitud_id>/aprobar')
def aprobar_solicitud(solicitud_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE SOLICITUDES SET STATUS = 'Concluida' WHERE IDSOLICITUD = ?", (solicitud_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Solicitud no encontrada"}), 404

        return jsonify({"message": "Solicitud aprobada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al aprobar solicitud", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.put('/solicitudes/<int:solicitud_id>/rechazar')
def rechazar_solicitud(solicitud_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE SOLICITUDES SET STATUS = 'Rechazada' WHERE IDSOLICITUD = ?", (solicitud_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Solicitud no encontrada"}), 404

        return jsonify({"message": "Solicitud aprobada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": "Error al aprobar solicitud", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# ------------------------------------
#  Ejecutar servidor
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5001, debug=True)
