import express from 'express';
import { connectToDatabase } from '../utils/dbConnect.js'; 


const router = express.Router();

const sanitizeValue = (value) => (value === undefined ? null : value);

router.post('/', async (req, res) => {
  let db;
  try {
    const data = req.body;
    console.log("Datos recibidos para creación:", data);

    const { idDocente, produccionesIntelectuales } = data;

    if (!idDocente || !produccionesIntelectuales?.length) {
      return res.status(400).json({
        error: "Faltan campos obligatorios o producciones intelectuales"
      });
    }

    db = await connectToDatabase();

    const [docenteResult] = await db.execute(
      'SELECT COUNT(*) AS count FROM docentes WHERE idDocente = ?',
      [idDocente]
    );

    if (docenteResult[0].count === 0) {
      await db.end();
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    for (const produccion of produccionesIntelectuales) {
      const { nombre, enlaceEditorial, idTipoPublicacion, idPais, fecha } = produccion;

      const insertProduccionQuery = `
        INSERT INTO produccionesintelectuales 
        (nombre, enlaceEditorial, idTipoPublicacion, idPais, fecha)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const produccionValues = [
        sanitizeValue(nombre?.trim()),
        sanitizeValue(enlaceEditorial?.trim()),
        sanitizeValue(idTipoPublicacion),
        sanitizeValue(idPais),
        sanitizeValue(fecha?.trim()),
      ];

      const [produccionResult] = await db.execute(
        insertProduccionQuery,
        produccionValues
      );

      const insertRelacionQuery = `
        INSERT INTO docentes_publicacionesintelectuales 
        (idDocente, idProduccionIntelectual)
        VALUES (?, ?)
      `;
      
      await db.execute(insertRelacionQuery, [
        idDocente, 
        produccionResult.insertId
      ]);
    }

    await db.end();
    return res.status(201).json({
      message: "Producciones intelectuales creadas correctamente"
    });

  } catch (error) {
    console.error("Error en el servidor:", error);
    if (db) await db.end();
    return res.status(500).json({
      error: "Error al crear producciones intelectuales"
    });
  }
});

export default router;
