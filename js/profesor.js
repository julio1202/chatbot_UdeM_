// ===========================================================
// 🎓 Panel del Profesor - Conexión con API (Node.js + PostgreSQL)
// ===========================================================

const API_BASE = "http://127.0.0.1:5000";

// 🧮 Cargar notas
async function cargarNotas(filtro = "") {
  const res = await fetch(`${API_BASE}/grades?search=${encodeURIComponent(filtro)}`);
  const data = await res.json();
  const tbody = document.querySelector("#tablaNotas tbody");
  tbody.innerHTML = "";

  data.forEach((nota) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${nota.estudiante}</td>
      <td>${nota.subject}</td>
      <td>${nota.item}</td>
      <td><input type="number" step="0.1" min="0" max="5" value="${nota.grade}" data-id="${nota.id}" class="notaEditable" /></td>
      <td>${nota.percentage}%</td>
      <td>
        <button class="btnGuardar" data-id="${nota.id}">💾</button>
        <button class="btnEliminar" data-id="${nota.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  // Asignar eventos
  document.querySelectorAll(".btnGuardar").forEach((btn) =>
    btn.addEventListener("click", (e) => actualizarNota(e.target.dataset.id))
  );
  document.querySelectorAll(".btnEliminar").forEach((btn) =>
    btn.addEventListener("click", (e) => eliminarNota(e.target.dataset.id))
  );
}

// ✏️ Actualizar nota
async function actualizarNota(id) {
  const input = document.querySelector(`input[data-id="${id}"]`);
  const nuevaNota = parseFloat(input.value);

  await fetch(`${API_BASE}/grades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grade: nuevaNota }),
  });

  alert("✅ Nota actualizada correctamente");
  cargarNotas();
}

// ❌ Eliminar nota
async function eliminarNota(id) {
  if (!confirm("¿Seguro que deseas eliminar esta nota?")) return;

  await fetch(`${API_BASE}/grades/${id}`, { method: "DELETE" });
  alert("🗑️ Nota eliminada");
  cargarNotas();
}

// ➕ Agregar nota
async function agregarNota() {
  const estudiante = prompt("Correo del estudiante:");
  const materia = prompt("Materia:");
  const item = prompt("Actividad (Parcial, Taller, etc):");
  const nota = parseFloat(prompt("Nota (0 a 5):"));
  const porcentaje = parseInt(prompt("Porcentaje (0 a 100):"));

  await fetch(`${API_BASE}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: estudiante,
      subject: materia,
      item: item,
      grade: nota,
      percentage: porcentaje,
    }),
  });

  alert("✅ Nota agregada correctamente");
  cargarNotas();
}

// 📚 Cargar cursos
async function cargarCursos() {
  const res = await fetch(`${API_BASE}/courses`);
  const data = await res.json();
  const lista = document.getElementById("listaCursos");
  lista.innerHTML = "";

  data.forEach((curso) => {
    const li = document.createElement("li");
    li.innerHTML = `${curso.name} <button class="btnEliminarCurso" data-id="${curso.id}">🗑️</button>`;
    lista.appendChild(li);
  });

  document.querySelectorAll(".btnEliminarCurso").forEach((btn) =>
    btn.addEventListener("click", (e) => eliminarCurso(e.target.dataset.id))
  );
}

// ➕ Agregar curso
async function agregarCurso() {
  const nombre = document.getElementById("nombreCurso").value.trim();
  if (!nombre) return alert("Por favor escribe el nombre del curso.");

  await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nombre }),
  });

  alert("✅ Curso agregado correctamente");
  document.getElementById("nombreCurso").value = "";
  cargarCursos();
}

// ❌ Eliminar curso
async function eliminarCurso(id) {
  if (!confirm("¿Deseas eliminar este curso?")) return;

  await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE" });
  alert("🗑️ Curso eliminado");
  cargarCursos();
}

// 🔍 Buscar notas
document.getElementById("btnBuscar").addEventListener("click", () => {
  const filtro = document.getElementById("buscarEstudiante").value;
  cargarNotas(filtro);
});

// Inicialización
document.getElementById("btnAgregarNota").addEventListener("click", agregarNota);
document.getElementById("btnAgregarCurso").addEventListener("click", agregarCurso);

// Cargar todo al inicio
cargarNotas();
cargarCursos();