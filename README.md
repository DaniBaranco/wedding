# 💒 Aplicación de Registro para Boda

Una aplicación web completa para gestionar confirmaciones de asistencia a bodas, desarrollada con Flask y una interfaz elegante.

## ✨ Características

- **Formulario de registro** para invitados con validación
- **Panel de administración** para ver todos los registros
- **Exportación a Excel** de la lista de invitados
- **Base de datos SQLite** para almacenar información
- **Diseño responsive** y elegante
- **Estadísticas en tiempo real**

## 🏗️ Estructura del Proyecto

```
wedding/
├── app.py                 # Aplicación Flask principal
├── requirements.txt       # Dependencias Python
├── wedding_guests.db      # Base de datos SQLite (se crea automáticamente)
├── templates/
│   ├── index.html        # Formulario de registro
│   └── admin.html        # Panel de administración
└── static/
    ├── css/
    │   ├── style.css     # Estilos principales
    │   └── admin.css     # Estilos del panel admin
    └── js/
        ├── script.js     # JavaScript del formulario
        └── admin.js      # JavaScript del panel admin
```

## 📋 Campos del Formulario

- **Nombre** (obligatorio)
- **Apellidos** (obligatorio)
- **Acompañante** (opcional)
- **Menú** (obligatorio): Vegetariano, Carnívoro, Pescado, Vegano, Sin Gluten
- **Autobús** (opcional): Checkbox para transporte

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
pip install flask flask-sqlalchemy pandas openpyxl
```

### 2. Ejecutar la aplicación
```bash
python app.py
```

### 3. Acceder a la aplicación
- **Formulario público**: http://localhost:5000
- **Panel de administración**: http://localhost:5000/admin

## 🔧 API Endpoints

### Públicos
- `GET /` - Formulario de registro
- `POST /api/register` - Registrar nuevo invitado

### Administración
- `GET /admin` - Panel de administración
- `GET /api/guests` - Obtener todos los invitados
- `GET /api/stats` - Obtener estadísticas
- `GET /api/export_excel` - Descargar archivo Excel

## 📊 Funciones de Administración

### Panel de Control
- Vista completa de todos los invitados registrados
- Estadísticas en tiempo real:
  - Total de invitados
  - Invitados que necesitan autobús
  - Invitados con acompañante
  - Distribución por tipo de menú

### Exportación a Excel
- Descarga automática del archivo `invitados_boda.xlsx`
- Incluye todos los datos de los invitados
- Formato limpio y organizado para impresión

## 🎨 Diseño

### Paleta de Colores
- **Primario**: #d4a574 (Dorado elegante)
- **Secundario**: #f7f3f0 (Crema suave)
- **Acento**: #8b4513 (Marrón chocolate)

### Características del Diseño
- Diseño responsive para móviles y escritorio
- Animaciones suaves y transiciones
- Validación visual de formularios
- Iconos y emojis temáticos de boda

## 🔒 Seguridad

- Validación de datos tanto en frontend como backend
- Sanitización de inputs
- Manejo seguro de errores
- Base de datos SQLite local

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Sistema**: Windows, macOS, Linux

## 🚀 Para Subir a GitHub

1. Crear repositorio en GitHub
2. Inicializar git en el directorio del proyecto:
```bash
git init
git add .
git commit -m "Aplicación inicial de registro para boda"
git branch -M main
git remote add origin https://github.com/tu-usuario/wedding-registration.git
git push -u origin main
```

## 📝 Personalización

### Cambiar Opciones de Menú
Editar en [app.py](app.py) y [templates/index.html](templates/index.html) las opciones del select de menú.

### Modificar Diseño
Los estilos están en [static/css/style.css](static/css/style.css) y [static/css/admin.css](static/css/admin.css).

### Agregar Campos
1. Modificar el modelo `Guest` en [app.py](app.py)
2. Actualizar el formulario en [templates/index.html](templates/index.html)
3. Modificar el JavaScript en [static/js/script.js](static/js/script.js)

## 🐛 Solución de Problemas

### Base de datos no se crea
- Verificar permisos de escritura en el directorio
- Ejecutar `db.create_all()` manualmente

### Error al exportar Excel
- Verificar que pandas y openpyxl están instalados
- Comprobar permisos de escritura

### Problemas de estilos
- Verificar que los archivos CSS se cargan correctamente
- Limpiar caché del navegador

## 👨‍💻 Desarrollo

Desarrollado con:
- **Backend**: Flask + SQLAlchemy
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Base de datos**: SQLite
- **Exportación**: Pandas + OpenPyXL

---

¡Esperamos que tengas una boda maravillosa! 💕