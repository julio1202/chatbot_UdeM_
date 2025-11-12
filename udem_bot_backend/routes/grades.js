const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Obtener todas las notas de un usuario
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  // Enhanced validation: Check for null, undefined, empty string, or non-numeric
  if (!userId || userId === 'null' || userId.trim() === '' || isNaN(Number(userId))) {
    return res.status(400).json({ error: "ID de usuario inválido" });
  }

  const parsedUserId = Number(userId);  // Safer than parseInt; ensures it's a number
  console.log('userId from params:', userId, 'parsed:', parsedUserId);  // Debug log

  try {
    const result = await pool.query(
      "SELECT * FROM grades WHERE user_id = $1 ORDER BY created_at DESC",
      [parsedUserId]  // Now guaranteed to be a number, not null
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener notas:", error);
    res.status(500).json({ error: "Error al obtener notas" });
  }
});

// ✅ Agregar una nueva nota
router.post("/", async (req, res) => {
  try {
    const { user_id, subject, item, grade, percentage } = req.body;

    // Validation for user_id
    if (!user_id || user_id === 'null' || user_id.toString().trim() === '' || isNaN(Number(user_id))) {
      return res.status(400).json({ error: "El user_id es obligatorio y debe ser numérico" });
    }

    // Validation for other fields (fix the syntax error and add checks)
    if (!subject || !item || grade === undefined || percentage === undefined || isNaN(Number(grade)) || isNaN(Number(percentage))) {
      return res.status(400).json({ error: "Faltan campos obligatorios o son inválidos" });
    }

    // Additional checks based on DB schema
    const parsedGrade = parseFloat(grade);  // grade is numeric(3,1), so use parseFloat
    const parsedPercentage = parseInt(percentage, 10);  // percentage is integer
    if (parsedGrade < 0 || parsedGrade > 999.9 || parsedPercentage < 0 || parsedPercentage > 100) {
      return res.status(400).json({ error: "Valores de grade o percentage fuera de rango" });
    }

    console.log('Inserting grade:', { user_id: Number(user_id), subject, item, grade: parsedGrade, percentage: parsedPercentage });  // Debug log

    const result = await pool.query(
      `INSERT INTO grades (user_id, subject, item, grade, percentage)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [Number(user_id), subject, item, parsedGrade, parsedPercentage]  // Ensure correct types
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ error: "No se pudo insertar la nota" });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al agregar nota:", error);
    // More specific error handling
    if (error.code === '23503') {  // Foreign key violation (e.g., user_id not in users)
      return res.status(400).json({ error: "El user_id no existe en la tabla users" });
    }
    if (error.code === '23505') {  // Unique violation (if any unique constraints)
      return res.status(400).json({ error: "Nota duplicada o conflicto de unicidad" });
    }
    res.status(500).json({ error: "Error al agregar nota" });
  }
});

// ✅ Eliminar una nota por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || id === 'null' || id.trim() === '' || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const parsedId = Number(id);
  console.log('id from params:', id, 'parsed:', parsedId);  // Debug log

  try {
    const result = await pool.query("DELETE FROM grades WHERE id = $1 RETURNING *", [parsedId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    res.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar nota:", error);
    res.status(500).json({ error: "Error al eliminar nota" });
  }
});

// ✅ Obtener todas las materias
router.get("/materias/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materias ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener materias:", error);
    res.status(500).json({ error: "Error al obtener materias" });
  }
});

// ✅ Agregar una nueva materia
router.post("/materias", async (req, res) => {
  try {
    const { nombre, descripcion, profesor_id } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre de la materia es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO materias (nombre, descripcion, profesor_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || null, profesor_id ? parseInt(profesor_id) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al agregar materia:", error);
    res.status(500).json({ error: "Error al agregar materia" });
  }
});

// ✅ Eliminar una materia por ID
router.delete("/materias/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await pool.query("DELETE FROM materias WHERE id = $1", [parseInt(id)]);
    res.json({ message: "Materia eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar materia:", error);
    res.status(500).json({ error: "Error al eliminar materia" });
  }
});

module.exports = router;