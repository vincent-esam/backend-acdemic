import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import docenteRouter from '../routes/docentes.js';
import produccionesRouter from '../routes/produccionesIntelectuales.js';

const app = express();

// Middleware esencial
app.use(cors());
app.use(express.json());

// Configuración de rutas
app.use('/api/docentes', docenteRouter);
app.use('/api/producciones', produccionesRouter);

// Ruta raíz para evitar 404
app.get('/api', (req, res) => {
  res.json({ 
    status: "API operativa ✅",
    endpoints: {
      docentes: "/api/docentes/{id}",
      producciones: "/api/producciones"
    }
  });
});

export default serverless(app);