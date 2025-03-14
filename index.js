import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import produccionesIntelectualesRouter from './routes/produccionesIntelectuales.js';
import docenteRouter from './routes/docentes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas con prefijo /api
app.use('/api/producciones-intelectuales', produccionesIntelectualesRouter);
app.use('/api/docentes', docenteRouter);

// Ruta raíz para evitar 404
app.get('/api', (req, res) => {
  res.json({ message: "API funcionando ✅" });
});

export const handler = serverless(app);