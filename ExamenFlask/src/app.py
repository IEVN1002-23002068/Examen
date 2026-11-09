from flask import Flask
from flask_cors import CORS

from routes.pedidos import pedidos_bp
from routes.ventas import ventas_bp

app = Flask(__name__)
CORS(app) 

app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
app.register_blueprint(ventas_bp, url_prefix='/api/ventas')


@app.route('/')
def inicio():
    return "Flask funcionando correctamente"


if __name__ == '__main__':
    app.run(debug=True)
