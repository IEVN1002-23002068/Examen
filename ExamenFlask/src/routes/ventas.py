import unicodedata

from flask import Blueprint, jsonify

from db import get_connection

ventas_bp = Blueprint('ventas', __name__)

# WEEKDAY() de MySQL: lunes = 0 ... domingo = 6
DIAS = {
    'lunes': 0, 'martes': 1, 'miercoles': 2, 'jueves': 3,
    'viernes': 4, 'sabado': 5, 'domingo': 6,
}
MESES = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'setiembre': 9,
    'octubre': 10, 'noviembre': 11, 'diciembre': 12,
}

CAMPOS = (
    "id, nombre, direccion, telefono, "
    "DATE_FORMAT(fecha_pedido, '%Y-%m-%d') AS fecha, total"
)


def normalizar(texto):
    """Minúsculas y sin acentos: 'Miércoles' -> 'miercoles'."""
    texto = unicodedata.normalize('NFD', texto.strip().lower())
    return ''.join(c for c in texto if unicodedata.category(c) != 'Mn')


def consultar(condicion, parametro):
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            f"SELECT {CAMPOS} FROM ventas WHERE {condicion} ORDER BY fecha_pedido, id",
            (parametro,),
        )
        ventas = cur.fetchall()
        total = sum(v['total'] for v in ventas)
        return jsonify({'exito': True, 'ventas': ventas, 'total': total})
    finally:
        conn.close()


# ---------- Ventas por día de la semana ----------
@ventas_bp.route('/dia/<dia>/', methods=['GET'])
def ventas_por_dia(dia):
    clave = normalizar(dia)
    if clave not in DIAS:
        return jsonify({'exito': False, 'mensaje': f'"{dia}" no es un día de la semana válido'}), 400
    return consultar('WEEKDAY(fecha_pedido) = %s', DIAS[clave])


# ---------- Ventas por mes ----------
@ventas_bp.route('/mes/<mes>/', methods=['GET'])
def ventas_por_mes(mes):
    clave = normalizar(mes)
    if clave not in MESES:
        return jsonify({'exito': False, 'mensaje': f'"{mes}" no es un mes válido'}), 400
    return consultar('MONTH(fecha_pedido) = %s', MESES[clave])


# ---------- Detalle de una venta ----------
@ventas_bp.route('/<int:id>/detalle/', methods=['GET'])
def detalle_venta(id):
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(f"SELECT {CAMPOS} FROM ventas WHERE id = %s", (id,))
        venta = cur.fetchone()
        if venta is None:
            return jsonify({'exito': False, 'mensaje': 'La venta no existe'}), 404

        cur.execute(
            "SELECT id, tamano, ingredientes, num_pizzas, subtotal "
            "FROM venta_detalle WHERE venta_id = %s ORDER BY id",
            (id,),
        )
        return jsonify({'exito': True, 'venta': venta, 'detalle': cur.fetchall()})
    finally:
        conn.close()
