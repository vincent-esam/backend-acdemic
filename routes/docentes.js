import { Router } from 'express';
import { connectToDatabase } from '../utils/dbConnect.js';

const router = Router();

router.get('/:id', async (req, res) => {
  let db;
  try {
    const { postulante } = req.params;
    db = await connectToDatabase();

    // Validación del ID
    if (!postulante || isNaN(Number(postulante))) {
      return res.status(400).json({ error: "ID del docente inválido" });
    }

    // Consulta SQL modificada (sin condición de estado)
    const query = `
SELECT 
    d.idDocente,
    d.apellidoMaterno,
    d.apellidoPaterno,
    d.nombres,
    d.numeroReferencia,
    d.correo,
    d.telefono,
    d.numeroDocumento,
    d.fechaNacimiento,
    d.ciudadRadicacion,
    d.genero,
    d.direccion,
    d.estado,
    d.fotografia,
    d.agendado,

    -- Sector
    COALESCE(CONCAT('{ "nombre": "', IFNULL(s.nombre, ''), '"}'), '{}') AS sector,

    -- País del docente
    COALESCE(CONCAT('{ "nombre": "', IFNULL(p.nombre, ''), '"}'), '{}') AS pais_docente,

    -- Tipo de documento
    COALESCE(CONCAT('{ "tipo": "', IFNULL(doc.tipo, ''), '"}'), '{}') AS tipo_documento,

    -- Estudios superiores
    COALESCE(
        CASE
            WHEN COUNT(es.idEstudioSuperior) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idEstudio":"', IFNULL(es.idEstudioSuperior, ''), '", ',
                              '"idPais":"', IFNULL(es.idPais, ''), '", ',
                              '"idGrado":"', IFNULL(es.idGrado, ''), '", ',
                              '"idModalidad":"', IFNULL(es.idModalidad, ''), '", ',
                              '"tipo":"', IFNULL(te.tipo, ''), '", ',
                              '"carrera":"', IFNULL(es.carrera, ''), '", ',
                              '"nombre":"', IFNULL(es.nombre, ''), '", ',
                              '"universidad":"', IFNULL(es.universidad, ''), '", ',
                              '"pais":"', IFNULL(ep.nombre, ''), '", ',
                              '"fecha":"', IFNULL(es.fecha, ''), '", ',
                              '"modalidad":"', IFNULL(m.tipo, ''), '", ',
                              '"gradoTipo":"', IFNULL(g.tipo, ''), '", ',
                              '"idTipo":"', IFNULL(te.idTipoEstudio, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS estudiosuperiores,

    -- Experiencias docentes
    COALESCE(
        CASE
            WHEN COUNT(ed.idExperienciaDocente) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idExperiencia":"', IFNULL(ed.idExperienciaDocente, ''), '", ',
                              '"materia":"', IFNULL(ed.materia, ''), '", ',
                              '"calidad":"', IFNULL(ed.calidad, ''), '", ',
                              '"universidad":"', IFNULL(ed.universidad, ''), '", ',
                              '"concluidoEl":"', IFNULL(ed.concluidoEl, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS experienciasdocentes,

    -- Idiomas
    COALESCE(
        CASE
            WHEN COUNT(id.idIdiomaDocente) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idIdiomaDocente":"', IFNULL(id.idIdiomaDocente, ''), '", ',
                              '"idIdioma":"', IFNULL(id.idIdioma, ''), '", ',
                              '"idioma":"', IFNULL(i.idioma, ''), '", ',
                              '"escritura":"', IFNULL(id.escritura, ''), '", ',
                              '"oral":"', IFNULL(id.oral, ''), '", ',
                              '"lectura":"', IFNULL(id.lectura, ''), '", ',
                              '"escucha":"', IFNULL(id.escucha, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS idiomas,

    -- Habilidades blandas
    COALESCE(
        CASE
            WHEN COUNT(hb.idHabilidadBlanda) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idHabilidadBlanda":"', IFNULL(hb.idHabilidadBlanda, ''), '", ',
                              '"habilidad":"', IFNULL(hb.habilidad, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS habilidades_blandas,

    -- Experiencias laborales
    COALESCE(
        CASE
            WHEN COUNT(el.idExperienciaLaboral) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idExperienciaLaboral":"', IFNULL(el.idExperienciaLaboral, ''), '", ',
                              '"nombreEmpresa":"', IFNULL(el.nombreEmpresa, ''), '", ',
                              '"cargo":"', IFNULL(el.cargo, ''), '", ',
                              '"ciudad":"', IFNULL(el.ciudad, ''), '", ',
                              '"fechaInicio":"', IFNULL(el.fechaInicio, ''), '", ',
                              '"fechaFinal":"', IFNULL(el.fechaFinal, ''), '", ',
                              '"pais":"', IFNULL(epais.nombre, ''), '", ',
                              '"descripcion":"', IFNULL(el.descripcion, ''), '", ',
                              '"referencia": {',
                                '"idReferencia":"', IFNULL(r.idReferencia, ''), '", ',
                                '"nombreCompleto":"', IFNULL(r.nombreCompleto, ''), '", ',
                                '"cargoR":"', IFNULL(r.cargo, ''), '", ',
                                '"numeroContacto":"', IFNULL(r.numeroContacto, ''), '"',
                              '}',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS experienciaslaborales,

    -- Publicaciones intelectuales
    COALESCE(
        CASE
            WHEN COUNT(pi.idProduccionIntelectual) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idProduccionIntelectual":"', IFNULL(pi.idProduccionIntelectual, ''), '", ',
                              '"nombre":"', IFNULL(pi.nombre, ''), '", ',
                              '"enlaceEditorial":"', IFNULL(pi.enlaceEditorial, ''), '", ',
                              '"pais":"', IFNULL(pp.nombre, ''), '", ',
                              '"fecha":"', IFNULL(pi.fecha, ''), '", ',
                              '"tipoPublicacion":"', IFNULL(tp.tipo, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS publicacionesintelectuales,

    -- Agendas
    COALESCE(
        CASE
            WHEN COUNT(ag.idAgenda) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"fecha":"', IFNULL(DATE_FORMAT(ag.fecha, '%Y-%m-%d %H:%i:%s'), ''), '", ',
                              '"link":"', IFNULL(ag.linkZoom, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS detalles,

    -- Áreas
    COALESCE(
        CASE
            WHEN COUNT(ar.idArea) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idArea":"', IFNULL(ar.idArea, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS areas,

    -- Cursos
    COALESCE(
        CASE
            WHEN COUNT(c.idCurso) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"nombre":"', IFNULL(c.nombre, ''), '", ',
                              '"universidad":"', IFNULL(c.lugar, ''), '", ',
                              '"pais":"', IFNULL(p2.nombre, ''), '", ',
                              '"anio":"', IFNULL(c.fechaInicio, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS cursos,

    -- Archivos del docente
    COALESCE(
        CASE
            WHEN COUNT(ad.id_ad) > 0 THEN
                CONCAT(
                    '[', 
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                              '"idArchivo":"', IFNULL(ad.id_ad, ''), '", ',
                              '"fechaSubida":"', IFNULL(ad.createdAt, ''), '", ',
                              '"nombreArchivo":"', IFNULL(ad.nombre_archivo, ''), '", ',
                              '"rutaArchivo":"', IFNULL(ad.ruta_archivo, ''), '", ',
                              '"idTipoArchivo":"', IFNULL(ad.idTipo_archivo, ''), '", ',
                              '"tipoArchivo":"', IFNULL(ta.tipo, ''), '"',
                            '}'
                        ) SEPARATOR ','
                    ), 
                    ']'
                )
            ELSE '[]'
        END,
        '[]'
    ) AS archivosDocente

FROM 
    docentes d
    LEFT JOIN sectores s ON d.idSector = s.idSector
    LEFT JOIN paises p ON d.idPais = p.idPais
    LEFT JOIN documentos doc ON d.idDocumento = doc.idDocumentos
    LEFT JOIN docentes_estudios de ON d.idDocente = de.idDocente
    LEFT JOIN estudiossuperiores es ON de.idEstudioSuperior = es.idEstudioSuperior
    LEFT JOIN tiposestudios te ON es.idTipoEstudio = te.idTipoEstudio
    LEFT JOIN modalidades m ON es.idModalidad = m.idModalidad
    LEFT JOIN grados g ON es.idGrado = g.idGrado
    LEFT JOIN paises ep ON es.idPais = ep.idPais  
    LEFT JOIN docente_experienciadocente ded ON d.idDocente = ded.idDocente
    LEFT JOIN experienciadocente ed ON ded.idExperienciaDocente = ed.idExperienciaDocente
    LEFT JOIN idiomas_docente id ON d.idDocente = id.idDocente
    LEFT JOIN idiomas i ON id.idIdioma = i.idIdioma
    LEFT JOIN habilidadesblandas hb ON d.idDocente = hb.idDocentes
    LEFT JOIN docente_experiencias dexp ON d.idDocente = dexp.idDocente
    LEFT JOIN experiencialaboral el ON dexp.idExperienciaLaboral = el.idExperienciaLaboral
    LEFT JOIN paises epais ON el.idPais = epais.idPais
    LEFT JOIN referencias r ON el.idReferencia = r.idReferencia
    LEFT JOIN docentes_publicacionesintelectuales dpi ON d.idDocente = dpi.idDocente
    LEFT JOIN produccionesintelectuales pi ON dpi.idProduccionIntelectual = pi.idProduccionIntelectual
    LEFT JOIN paises pp ON pi.idPais = pp.idPais
    LEFT JOIN tipospublicaciones tp ON pi.idTipoPublicacion = tp.idTipoPublicacion
    LEFT JOIN agendas ag ON d.idDocente = ag.idDocente
    LEFT JOIN areas ar ON d.idAreaInteres = ar.idArea
    LEFT JOIN docente_curso dc ON d.idDocente = dc.idDocente
    LEFT JOIN cursos c ON dc.idCurso = c.idCurso
    LEFT JOIN paises p2 ON c.idPais = p2.idPais
    LEFT JOIN archivos_docentes ad ON d.idDocente = ad.idDocente
    LEFT JOIN tipo_archivo ta ON ad.idTipo_archivo = ta.id_ta
WHERE 
    d.idDocente = ?
GROUP BY 
    d.idDocente;
    `;

    const [results] = await db.query(query, [Number(postulante)]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const docenteData = results[0];

    // Lista completa de campos JSON
    const jsonFields = [
      'estudiosuperiores',
      'experienciasdocentes',
      'idiomas',
      'habilidades_blandas',
      'experienciaslaborales',
      'publicacionesintelectuales',
      'detalles',
      'areas',
      'cursos',
      'archivosDocente'
    ];

    // Parsear campos JSON dinámicamente
    jsonFields.forEach(field => {
      try {
        docenteData[field] = JSON.parse(docenteData[field]);
      } catch (e) {
        docenteData[field] = [];
      }
    });

    await db.end();
    return res.status(200).json(docenteData);

  } catch (error) {
    console.error("Error al obtener el docente:", error);
    if (db) await db.end();
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;