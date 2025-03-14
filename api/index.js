import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import docenteRouter from '../routes/docentes.js';
import produccionesRouter from '../routes/produccionesIntelectuales.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas bajo /api
app.use('/api/docentes', docenteRouter);
app.use('/api/producciones', produccionesRouter);

// Health Check
app.get('/api', (req, res) => {
  res.json({ status: 'API operativa', version: '1.0.0' });
});

// Exportación requerida por Vercel
export default serverless(app);