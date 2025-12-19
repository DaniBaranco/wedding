from flask import Flask, render_template, request, jsonify, send_file, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pandas as pd
import os

app = Flask(__name__)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wedding_guests.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'

db = SQLAlchemy(app)

# Modelo de la base de datos
class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    num_acompanantes = db.Column(db.Integer, default=0)
    acompanantes = db.Column(db.Text, default='')  # JSON string con los nombres
    menu = db.Column(db.String(50), nullable=False)
    autobus = db.Column(db.Boolean, default=False)
    personas_autobus = db.Column(db.Integer, default=0)  # Total de personas que usan autobús
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_acompanantes_list(self):
        if not self.acompanantes:
            return []
        import json
        try:
            return json.loads(self.acompanantes)
        except:
            return []
    
    def set_acompanantes_list(self, acompanantes_list):
        import json
        self.acompanantes = json.dumps(acompanantes_list) if acompanantes_list else ''
        self.num_acompanantes = len(acompanantes_list) if acompanantes_list else 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'num_acompanantes': self.num_acompanantes,
            'acompanantes': self.get_acompanantes_list(),
            'menu': self.menu,
            'autobus': self.autobus,
            'personas_autobus': self.personas_autobus,
            'fecha_registro': self.fecha_registro.strftime('%d/%m/%Y %H:%M')
        }

# Rutas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/confirm/<int:guest_id>')
def confirm_guest(guest_id):
    # Base de datos sincronizada con JavaScript (con acompañantes predefinidos)
    guest_list = [
        {'id': 1, 'nombre': 'Jaime', 'apellidos': 'Montero Moreno', 'categoria': 'Familia', 'acompanantes_predefinidos': ['María Montero', 'Lucía Montero']},
        {'id': 2, 'nombre': 'José', 'apellidos': 'Martínez González', 'categoria': 'Amigo', 'acompanantes_predefinidos': ['Carmen Martínez']},
        {'id': 3, 'nombre': 'Carmen', 'apellidos': 'Rodríguez Sánchez', 'categoria': 'Familia'},
        {'id': 4, 'nombre': 'Antonio', 'apellidos': 'Fernández Pérez', 'categoria': 'Compañero de trabajo', 'acompanantes_predefinidos': ['Isabel Fernández', 'Diego Fernández', 'Sofia Fernández']},
        {'id': 5, 'nombre': 'Ana', 'apellidos': 'López Martín', 'categoria': 'Amiga'},
        {'id': 6, 'nombre': 'Manuel', 'apellidos': 'Sánchez Ruiz', 'categoria': 'Familia', 'acompanantes_predefinidos': ['Pilar Sánchez']},
        {'id': 7, 'nombre': 'Isabel', 'apellidos': 'Pérez Jiménez', 'categoria': 'Vecina'},
        {'id': 8, 'nombre': 'Francisco', 'apellidos': 'Martín Moreno', 'categoria': 'Amigo', 'acompanantes_predefinidos': ['Teresa Martín', 'Pablo Martín', 'Elena Martín']},
        {'id': 9, 'nombre': 'Pilar', 'apellidos': 'Jiménez Alonso', 'categoria': 'Familia'},
        {'id': 10, 'nombre': 'Miguel', 'apellidos': 'Moreno Romero', 'categoria': 'Primo', 'acompanantes_predefinidos': ['Rosa Moreno']},
        {'id': 11, 'nombre': 'Dolores', 'apellidos': 'Alonso Navarro', 'categoria': 'Abuela'},
        {'id': 12, 'nombre': 'David', 'apellidos': 'Romero Gutiérrez', 'categoria': 'Amigo del colegio', 'acompanantes_predefinidos': ['Laura Romero', 'Alex Romero']},
        {'id': 13, 'nombre': 'Josefa', 'apellidos': 'Navarro Torres', 'categoria': 'Tía'},
        {'id': 14, 'nombre': 'Juan', 'apellidos': 'Gutiérrez Vázquez', 'categoria': 'Hermano', 'acompanantes_predefinidos': ['Marta Gutiérrez', 'Carlos Gutiérrez', 'Ana Gutiérrez']},
        {'id': 15, 'nombre': 'Teresa', 'apellidos': 'Torres Ramos', 'categoria': 'Amiga'},
        {'id': 16, 'nombre': 'Daniel', 'apellidos': 'Vázquez Castro', 'categoria': 'Cuñado', 'acompanantes_predefinidos': ['Patricia Vázquez']},
        {'id': 17, 'nombre': 'Rosa', 'apellidos': 'Ramos Ortega', 'categoria': 'Madrina'},
        {'id': 18, 'nombre': 'Carlos', 'apellidos': 'Castro Delgado', 'categoria': 'Amigo', 'acompanantes_predefinidos': ['Silvia Castro', 'Marcos Castro']},
        {'id': 19, 'nombre': 'Francisca', 'apellidos': 'Ortega Herrera', 'categoria': 'Familia'},
        {'id': 20, 'nombre': 'Rafael', 'apellidos': 'Delgado Ibáñez', 'categoria': 'Padrino', 'acompanantes_predefinidos': ['Mercedes Delgado']}
    ]
    
    guest_data = None
    for guest in guest_list:
        if guest['id'] == guest_id:
            guest_data = guest
            break
    
    if not guest_data:
        return redirect('/')
        
    return render_template('confirm.html', guest=guest_data)

@app.route('/admin')
def admin():
    guests = Guest.query.all()
    return render_template('admin.html', guests=guests)

@app.route('/api/register', methods=['POST'])
def register_guest():
    try:
        data = request.get_json()
        
        # Validar datos obligatorios
        if not data.get('nombre') or not data.get('apellidos') or not data.get('menu'):
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        # Procesar acompañantes
        num_acompanantes = data.get('num_acompanantes', 0)
        acompanantes_list = data.get('acompanantes', [])
        
        # Calcular personas para autobús (invitado principal + acompañantes)
        personas_autobus = 0
        if data.get('autobus', False):
            personas_autobus = 1 + num_acompanantes  # Invitado + acompañantes
        
        # Crear nuevo invitado
        guest = Guest(
            nombre=data['nombre'].strip(),
            apellidos=data['apellidos'].strip(),
            menu=data['menu'],
            autobus=data.get('autobus', False),
            personas_autobus=personas_autobus
        )
        
        # Establecer acompañantes
        guest.set_acompanantes_list(acompanantes_list)
        
        db.session.add(guest)
        db.session.commit()
        
        return jsonify({
            'message': 'Registro exitoso', 
            'id': guest.id,
            'personas_autobus': personas_autobus
        }), 201
    
    except Exception as e:
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/guests')
def get_guests():
    guests = Guest.query.all()
    return jsonify([guest.to_dict() for guest in guests])

@app.route('/api/export_excel')
def export_excel():
    try:
        guests = Guest.query.all()
        
        # Preparar datos para Excel
        data = []
        for guest in guests:
            acompanantes_str = ', '.join(guest.get_acompanantes_list()) if guest.get_acompanantes_list() else 'Sin acompañantes'
            data.append({
                'ID': guest.id,
                'Nombre': guest.nombre,
                'Apellidos': guest.apellidos,
                'Número de Acompañantes': guest.num_acompanantes,
                'Acompañantes': acompanantes_str,
                'Menú': guest.menu,
                'Autobús': 'Sí' if guest.autobus else 'No',
                'Personas en Autobús': guest.personas_autobus,
                'Fecha de Registro': guest.fecha_registro.strftime('%d/%m/%Y %H:%M')
            })
        
        # Crear DataFrame y exportar a Excel
        df = pd.DataFrame(data)
        excel_path = 'invitados_boda.xlsx'
        df.to_excel(excel_path, index=False, sheet_name='Invitados')
        
        return send_file(excel_path, as_attachment=True, download_name='invitados_boda.xlsx')
    
    except Exception as e:
        return jsonify({'error': 'Error al exportar'}), 500

@app.route('/api/stats')
def get_stats():
    total_guests = Guest.query.count()
    total_personas_autobus = db.session.query(db.func.sum(Guest.personas_autobus)).scalar() or 0
    guests_with_companions = Guest.query.filter(Guest.num_acompanantes > 0).count()
    total_acompanantes = db.session.query(db.func.sum(Guest.num_acompanantes)).scalar() or 0
    
    menu_stats = {}
    menus = db.session.query(Guest.menu, db.func.count(Guest.menu)).group_by(Guest.menu).all()
    for menu, count in menus:
        menu_stats[menu] = count
    
    return jsonify({
        'total_guests': total_guests,
        'total_personas_autobus': total_personas_autobus,
        'guests_with_companions': guests_with_companions,
        'total_acompanantes': total_acompanantes,
        'total_personas': total_guests + total_acompanantes,  # Total de personas en la boda
        'menu_stats': menu_stats
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)