// ======================================================
// 📚 RUTA: Courses (Gestión de cursos)
// ======================================================
const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Obtener todos los cursos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener cursos:", err);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
});

// ✅ Crear un nuevo curso
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    await pool.query("INSERT INTO courses (name) VALUES ($1)", [name]);
    res.json({ message: "✅ Curso agregado correctamente" });
  } catch (err) {
    console.error("❌ Error al agregar curso:", err);
    res.status(500).json({ error: "Error al crear el curso" });
  }
});

// ✅ Eliminar curso por ID
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ message: "🗑️ Curso eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar curso:", err);
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
});

module.exports = router;