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

// Servir archivos estáticos desde la carpeta 'public' con tipos MIME correctos
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Ruta principal que sirve directamente el index.html de la raíz del proyecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejar rutas no encontradas
app.get('*', (req, res) => {
    res.status(404).send('Página no encontrada');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});