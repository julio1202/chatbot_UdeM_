// ======================================================
// 📗 ROUTER: MATERIAS
// ======================================================
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ======================================================
// 📥 OBTENER TODAS LAS MATERIAS (opcionalmente por profesor_id)
// ======================================================
router.get('/', async (req, res) => {
  const { profesor_id } = req.query; // ?profesor_id=1
  try {
    let query = 'SELECT * FROM materias ORDER BY created_at DESC';
    let params = [];

    if (profesor_id) {
      query = 'SELECT * FROM materias WHERE profesor_id = $1 ORDER BY created_at DESC';
      params = [profesor_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener materias:', err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

// ======================================================
// ➕ AGREGAR UNA NUEVA MATERIA
// ======================================================
router.post('/', async (req, res) => {
  const { nombre, descripcion, profesor_id } = req.body;

  if (!nombre || !profesor_id) {
    return res.status(400).json({ error: 'Nombre y profesor_id son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO materias (nombre, descripcion, profesor_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || '', profesor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      // Violación de UNIQUE constraint (materias_nombre_key)
      return res.status(400).json({ error: 'El nombre de la materia ya existe' });
    }
    console.error('❌ Error al agregar materia:', err);
    res.status(500).json({ error: 'Error al agregar materia' });
  }
});

// ======================================================
// 🗑️ ELIMINAR UNA MATERIA POR ID
// ======================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM materias WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json({ message: 'Materia eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar materia:', err);
    res.status(500).json({ error: 'Error al eliminar materia' });
  }
});

// ======================================================
// ✏️ ACTUALIZAR UNA MATERIA
// ======================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      `UPDATE materias 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion)
       WHERE id = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar materia:', err);
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
});

module.exports = router;
