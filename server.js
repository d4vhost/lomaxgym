// Importar los módulos necesarios
const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicializar la aplicación Express
const app = express();
const PORT = 3000;

// Configuración de middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que sirve directamente el index.html de la raíz del proyecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//Actualizado