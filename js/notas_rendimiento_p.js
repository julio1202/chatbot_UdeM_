/**
 * notas_rendimiento_p.js
 * Control completo de materias y notas
 * Compatible con rutas: /api/materias y /api/grades
 */

document.addEventListener("DOMContentLoaded", async () => {
  const subjectsList = document.getElementById("subjectsList");
  const addSubjectBtn = document.getElementById("addSubjectBtn");
  const addGradeBtn = document.getElementById("addGradeBtn");
  const gradesTableBody = document.getElementById("gradesBody");  // Cambiado a gradesBody para coincidir con HTML
  const userId = localStorage.getItem("userId");

  // ========================
  // 🔹 Función auxiliar para obtener ID de materia por nombre
  // ========================
  async function getMateriaId(nombre) {
    try {
      const res = await fetch(`/api/materias?userId=${userId}`);
      const materias = await res.json();
      const materia = materias.find(m => m.nombre === nombre);
      return materia ? materia.id : null;
    } catch (err) {
      console.error("Error obteniendo ID de materia:", err);
      return null;
    }
  }

  // ========================
  // 🔹 Cargar materias
  // ========================
  async function cargarMaterias() {
    try {
      const res = await fetch(`/api/materias?userId=${userId}`);
      const materias = await res.json();
      subjectsList.innerHTML = "";

      materias.forEach((m) => {
        const li = document.createElement("li");
        li.textContent = m.nombre;
        li.dataset.id = m.id;
        li.dataset.name = m.nombre;
        li.classList.add("materia-item");

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.classList.add("delete-btn");
        delBtn.dataset.id = m.id;
        li.appendChild(delBtn);

        subjectsList.appendChild(li);
      });
    } catch (err) {
      console.error("Error cargando materias:", err);
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
    }
  }

  // ========================
  // 🔹 Seleccionar materia
  // ========================
  subjectsList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) return;

    const li = e.target.closest("li");
    if (!li) return;

    document
      .querySelectorAll("#subjectsList li")
      .forEach((el) => el.classList.remove("active"));
    li.classList.add("active");

    const materiaNombre = li.dataset.name;
    const materiaId = li.dataset.id;  // Obtener el ID del dataset
    await renderGradesForMateria(materiaNombre, materiaId);  // Pasar nombre e ID
  });

  // ========================
  // 🔹 Eliminar materia
  // ========================
  subjectsList.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;

    const id = e.target.dataset.id;
    const nombre = e.target.closest("li").dataset.name;

    const confirm = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/materias/${id}`, { method: "DELETE" });

      if (res.ok) {
        await Swal.fire("✅", "Materia eliminada correctamente.", "success");
        await cargarMaterias();
      } else {
        const text = await res.text();
        console.error("Error al eliminar materia:", res.status, text);
        await Swal.fire("Error", "No se pudo eliminar la materia.", "error");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      await Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  });

  // ========================
  // 🔹 Renderizar notas (modificada para usar ID)
  // ========================
  async function renderGradesForMateria(materiaNombre, materiaId) {
    try {
      // Usar el ID en la query para filtrar correctamente
      const res = await fetch(`/api/grades?userId=${userId}&subject=${materiaId}`);
      const notas = await res.json();

      gradesTableBody.innerHTML = "";

      if (notas.length === 0) {
        gradesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay notas registradas</td></tr>`;
        return;
      }

      notas.forEach((n) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${n.student_name || "N/A"}</td>
          <td>${n.item}</td>
          <td>${n.grade}</td>
          <td>${n.percentage || ""}</td>
          <td>—</td>  <!-- TOTAL placeholder -->
          <td><button class="delete-grade-btn" data-id="${n.id}">🗑️</button></td>
        `;
        gradesTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error("Error al cargar notas:", err);
      Swal.fire("Error", "No se pudieron cargar las notas", "error");
    }
  }

  // ========================
  // 🔹 Agregar materia
  // ========================
  addSubjectBtn.addEventListener("click", async () => {
    const { value: nombre } = await Swal.fire({
      title: "Agregar materia",
      input: "text",
      inputPlaceholder: "Nombre de la materia",
      showCancelButton: true,
      confirmButtonText: "Guardar",
    });

    if (!nombre) return;

    try {
      const res = await fetch("/api/materias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, userId }),
      });

      if (res.ok) {
        Swal.fire("✅", "Materia agregada correctamente", "success");
        await cargarMaterias();
      } else {
        Swal.fire("Error", "No se pudo agregar la materia", "error");
      }
    } catch (err) {
      console.error("Error agregando materia:", err);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  });

  // ========================
  // 🔹 Agregar nota
  // ========================
  addGradeBtn.addEventListener("click", async () => {
    const materiaNombre = document.querySelector("#subjectsList li.active")?.dataset.name;
    const materiaId = document.querySelector("#subjectsList li.active")?.dataset.id;
    if (!materiaNombre || !materiaId) {
      await Swal.fire("Atención", "Selecciona una materia primero.", "info");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Agregar Nota",
      html: `
        <input id="swal-studentId" type="number" class="swal2-input" placeholder="ID del estudiante (ej: 1)">
        <input id="swal-item" class="swal2-input" placeholder="Nombre del ítem (Ej: Examen 1)">
        <input id="swal-grade" type="number" min="0" max="5" step="0.1" class="swal2-input" placeholder="Nota (0–5)">
        <input id="swal-percent" type="number" min="0" max="100" step="1" class="swal2-input" placeholder="Porcentaje (opcional)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      preConfirm: () => {
        const studentId = parseInt(document.getElementById("swal-studentId").value, 10);
        const item = document.getElementById("swal-item").value.trim();
        const grade = parseFloat(document.getElementById("swal-grade").value);
        const percentage = parseFloat(document.getElementById("swal-percent").value);

        // Validaciones básicas
        if (isNaN(studentId) || studentId <= 0) {
          Swal.showValidationMessage("El ID del estudiante debe ser un número entero positivo.");
          return false;
        }
        if (!item) {
          Swal.showValidationMessage("El nombre del ítem es obligatorio.");
          return false;
        }
        if (isNaN(grade) || grade < 0 || grade > 5) {
          Swal.showValidationMessage("La nota debe ser un número entre 0 y 5.");
          return false;
        }
        if (!isNaN(percentage) && (percentage < 0 || percentage > 100)) {
          Swal.showValidationMessage("El porcentaje debe ser un número entre 0 y 100.");
          return false;
        }

        return {
          studentId,
          item,
          grade,
          percentage: isNaN(percentage) ? null : percentage,
        };
      },
    });

    if (!formValues) return;  // Si la validación falló, no continúa

    // Obtener el ID de la materia antes de enviar (ya lo tenemos del dataset)
    const subjectId = materiaId;  // Usar el ID directamente

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: formValues.studentId,  // Cambiado a "user_id" y numérico
          subject: subjectId,  // Ahora usa el ID numérico en lugar del nombre
          item: formValues.item,
          grade: formValues.grade,
          percentage: formValues.percentage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire("✅", "Nota agregada correctamente", "success");
        await renderGradesForMateria(materiaNombre, materiaId);  // Recargar con nombre e ID
      } else {
        console.error("Error al agregar nota:", data);
        await Swal.fire("Error", data.error || "No se pudo guardar la nota", "error");
      }
    } catch (err) {
      console.error(err);
      await Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  });

  // ========================
  // 🔹 Eliminar nota
  // ========================
  gradesTableBody.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-grade-btn")) return;
    const id = e.target.dataset.id;

    const confirm = await Swal.fire({
      title: "¿Eliminar esta nota?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/grades/${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("✅", "Nota eliminada correctamente", "success");
        const materiaNombre = document.querySelector("#subjectsList li.active")?.dataset.name;
        const materiaId = document.querySelector("#subjectsList li.active")?.dataset.id;
        if (materiaNombre && materiaId) await renderGradesForMateria(materiaNombre, materiaId);  // Recargar con nombre e ID
      } else {
        Swal.fire("Error", "No se pudo eliminar la nota", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  });

  // ========================
  // 🔹 Inicializar
  // ========================
  await cargarMaterias();
});