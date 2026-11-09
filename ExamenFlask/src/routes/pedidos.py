from flask import Blueprint, jsonify, request

from db import get_connection

pedidos_bp = Blueprint('pedidos', __name__)

PRECIOS_TAMANO = {'Chica': 40, 'Mediana': 80, 'Grande': 120}
PRECIOS_INGREDIENTE = {'Jamón': 10, 'Piña': 10, 'Champiñones': 10}


def respuesta_error(mensaje, codigo=400):
    return jsonify({'exito': False, 'mensaje': mensaje}), codigo

@pedidos_bp.route('/detalle/', methods=['GET'])
def obtener_detalle():
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, tamano, ingredientes, num_pizzas, subtotal "
            "FROM detalle_temporal ORDER BY id"
        )
        detalle = cur.fetchall()
        total = sum(d['subtotal'] for d in detalle)
        return jsonify({'exito': True, 'detalle': detalle, 'total': total})
    finally:
        conn.close()


# ---------- Agregar ----------
@pedidos_bp.route('/detalle/', methods=['POST'])
def agregar_pizza():
    datos = request.get_json() or {}
    tamano = datos.get('tamano')
    ingredientes = datos.get('ingredientes') or []

    try:
        num_pizzas = int(datos.get('num_pizzas'))
    except (TypeError, ValueError):
        return respuesta_error('El número de pizzas no es válido')

    if tamano not in PRECIOS_TAMANO:
        return respuesta_error('Selecciona un tamaño de pizza válido')
    if num_pizzas < 1:
        return respuesta_error('El número de pizzas debe ser mayor a 0')
    if any(i not in PRECIOS_INGREDIENTE for i in ingredientes):
        return respuesta_error('Ingrediente no válido')

    precio_unitario = PRECIOS_TAMANO[tamano] + sum(
        PRECIOS_INGREDIENTE[i] for i in ingredientes
    )
    subtotal = precio_unitario * num_pizzas
    texto_ingredientes = ', '.join(ingredientes) if ingredientes else 'Ninguno'

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO detalle_temporal (tamano, ingredientes, num_pizzas, subtotal) "
            "VALUES (%s, %s, %s, %s)",
            (tamano, texto_ingredientes, num_pizzas, subtotal),
        )
        conn.commit()
        return jsonify({'exito': True, 'mensaje': 'Pizza agregada', 'id': cur.lastrowid})
    except Exception as e:
        conn.rollback()
        return respuesta_error(f'Error al agregar: {e}', 500)
    finally:
        conn.close()


# ---------- Quitar ----------
@pedidos_bp.route('/detalle/<int:id>', methods=['DELETE'])
def quitar_pizza(id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM detalle_temporal WHERE id = %s", (id,))
        conn.commit()
        if cur.rowcount == 0:
            return respuesta_error('La pizza no existe en el pedido', 404)
        return jsonify({'exito': True, 'mensaje': 'Pizza eliminada del pedido'})
    except Exception as e:
        conn.rollback()
        return respuesta_error(f'Error al quitar: {e}', 500)
    finally:
        conn.close()


# ---------- Terminar ----------
@pedidos_bp.route('/terminar/', methods=['POST'])
def terminar_pedido():
    datos = request.get_json() or {}
    nombre = (datos.get('nombre') or '').strip()
    direccion = (datos.get('direccion') or '').strip()
    telefono = (datos.get('telefono') or '').strip()
    fecha = datos.get('fecha')  # formato YYYY-MM-DD

    if not (nombre and direccion and telefono and fecha):
        return respuesta_error('Faltan datos del cliente')

    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT COUNT(*) AS n, COALESCE(SUM(subtotal), 0) AS total "
            "FROM detalle_temporal"
        )
        fila = cur.fetchone()
        if fila['n'] == 0:
            return respuesta_error('Agrega al menos una pizza al pedido')

        total = int(fila['total'])

        cur.execute(
            "INSERT INTO ventas (nombre, direccion, telefono, fecha_pedido, total) "
            "VALUES (%s, %s, %s, %s, %s)",
            (nombre, direccion, telefono, fecha, total),
        )
        venta_id = cur.lastrowid

        # Se copia el detalle temporal al detalle definitivo
        cur.execute(
            "INSERT INTO venta_detalle (venta_id, tamano, ingredientes, num_pizzas, subtotal) "
            "SELECT %s, tamano, ingredientes, num_pizzas, subtotal FROM detalle_temporal",
            (venta_id,),
        )
        cur.execute("DELETE FROM detalle_temporal")
        conn.commit()

        return jsonify({
            'exito': True,
            'mensaje': f'Pedido registrado. Importe total a pagar: ${total}',
            'total': total,
            'venta_id': venta_id,
        })
    except Exception as e:
        conn.rollback()
        return respuesta_error(f'Error al guardar el pedido: {e}', 500)
    finally:
        conn.close()
