document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("userInput");
  const chat = document.getElementById("chatMessages");

  function createMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

    if (sender === "bot") {
      msg.innerHTML = `<div class="avatar">🤖</div><div class="bubble">${text}</div>`;
    } else {
      msg.innerHTML = `<div class="bubble">${text}</div>`;
    }

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message bot typing";
    typing.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    `;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
    return typing;
  }

  function botResponse(text) {
    const t = text.toLowerCase();
    if (t.includes("nota") || t.includes("promedio"))
      return "Puedes calcular tu promedio en la sección <strong>Notas/Rendimiento</strong> 📊";
    if (t.includes("calendario") || t.includes("alarma"))
      return "Ve a <strong>Calendario/Alarmas</strong> para crear recordatorios ⏰";
    if (t.includes("salud"))
      return "En la sección <strong>Salud</strong> encontrarás recursos de bienestar ❤️";
    if (t.includes("asesor"))
      return "Puedo derivarte a un <strong>asesor humano</strong> si lo necesitas 👨‍🏫";
    return `Estoy procesando tu mensaje: "${text}" 🤔`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    createMessage(text, "user");
    input.value = "";

    const typing = showTyping();

    setTimeout(() => {
      typing.remove();
      createMessage(botResponse(text), "bot");
    }, 1200);
  });
});
