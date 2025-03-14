import express from 'express';
import cors from 'cors';
import produccionesIntelectualesRouter from './routes/produccionesIntelectuales.js';
import docenteRouter from './routes/docentes.js'; // Añade esta línea

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/producciones-intelectuales', produccionesIntelectualesRouter);
app.use('/docentes', docenteRouter); // Añade esta línea

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});