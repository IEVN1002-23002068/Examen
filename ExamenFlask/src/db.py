import mysql.connector

# Ajusta usuario y contraseña a tu MySQL
DB_CONFIG = {
    'host': 'localhost',
    'user': 'Estephania',
    'password': 'fanny1234',
    'database': 'pizzeria',
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)
