
const express = require('express');
const db = require('./database.js');


const app = express();
const port = 8000;


// Ruta: obtener todos los pacientes (primeros 100)
app.get('/api/pacientesALL', (req, res) => {
  const query = 'SELECT * FROM datos_pacientes LIMIT 100';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Ruta: buscar paciente por número de documento
app.get('/api/pacientes/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;
  const query = 'SELECT * FROM datos_pacientes WHERE tipo_documento = ? AND identificacion = ?';
  db.all(query, [tipo, documento], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    res.json(row);
  });
});

// Modulo de Autocuidado

app.get('/api/pacientes/indicadores/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;
  const query = `
    SELECT DISTINCT
      identificacion,
      "Talla1" AS Altura,
      "Peso1" AS Peso,
      "Tension Arterial Sistolica Control" AS Tension_Arterial_Sistolica,
      "Tension Arterial Diastolica Control" AS Tension_Arterial_Diastolica,
      "Perimetro Abdominal Control" AS Perimetro_Abdominal,
      "Colesterol Total1" AS Colesterol_Total,
      "HDL (mg/dl) Control" AS HDL
    FROM datos_pacientes
    WHERE
    tipo_documento = ?
    AND
      identificacion = ?`;
  db.all(query, [tipo, documento], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(rows);
  });
});

// Modulo de Citas
// Ruta: obtener todas las citas del paciente por tipo y documento

app.get('/api/citas/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;

  const query = `
    SELECT DISTINCT
      tipo_documento,
      identificacion,
      estado,
      fecha_cita,
      "Nombre Medico" AS nombre_medico,
      especialidad
    FROM datos_pacientes
    WHERE tipo_documento = ?
      AND identificacion = ?
      AND fecha_cita IS NOT NULL
    ORDER BY fecha_cita DESC
  `;

  db.all(query, [tipo, documento], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: 'No se encontraron citas para el paciente' });
    res.json(rows);
  });
});

// Modulo de Programas
// Ruta: obtener todas las citas por programa de un paciente por tipo y documento (En Proceso)

app.get('/api/programas/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;

  const query = `
    SELECT DISTINCT
      tipo_documento,
      identificacion,
      "Programa Actual" AS Programa,
      fecha_cita,
      "Nombre Medico" AS nombre_medico,
      especialidad,
      "Especialidad Cita" AS especialidad_cita
    FROM datos_pacientes
    WHERE
    tipo_documento = ?
     AND identificacion = ?
    ORDER BY fecha_cita ASC;
  `;

  db.all(query, [tipo, documento], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: 'No hay citas pendientes' });
    res.json(rows);
  });
});

//Modulo de Exámenes
// Ruta: obtener todos los exámenes de un paciente por tipo y documento
app.get('/api/examenes/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;

  const query = `
    SELECT DISTINCT
      tipo_documento,
      identificacion,
      nom_medico_remisor,
      fecha_orden,
      nombre_cups AS Examen
    FROM datos_pacientes
    WHERE
      tipo_documento = ?
      AND
      identificacion = ?
      AND nombre_cups IS NOT NULL
    ORDER BY fecha_orden DESC
  `;

  db.all(query, [tipo, documento], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: 'No se encontraron exámenes para el paciente' });
    res.json(rows);
  });
});

// Modulo de Medicamentos
// Ruta: obtener todos los medicamentos de un paciente por tipo y documento

app.get('/api/medicamentos/:tipo/:documento', (req, res) => {
  const { tipo, documento } = req.params;

  const query = `
    SELECT DISTINCT
      tipo_documento,
      identificacion,
      "Nombre Medico" AS medico,
      nom_medico_remisor AS medico_remisor,
      nom_med AS nombre_medicamento,
      pre_med AS prescripcion_medicamento,
      cant AS Cantidad,
      Fecha_med AS fecha_vigencia
    FROM datos_pacientes
    WHERE
    tipo_documento = ?
      AND
      identificacion = ?
      AND nom_med IS NOT NULL
    ORDER BY Fecha_med DESC
  `;

  db.all(query, [tipo, documento], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: 'No se encontraron medicamentos para el paciente' });
    res.json(rows);
  });
});



app.listen(port, () => {
  console.log(`🚀 Servidor Express en http://localhost:${port}`);
});
