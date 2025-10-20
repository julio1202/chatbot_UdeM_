// === chat_bot.js ===
// Chat inteligente con hora automática, animación "escribiendo..." y respuestas por contexto
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".input-area");
  const textarea = document.querySelector("#chatTextarea") || document.querySelector(".input-area textarea");
  const chat = document.querySelector(".chat-messages");

  // Depuración: verificar elementos
  console.log("chat_bot.js loaded. form:", !!form, "textarea:", !!textarea, "chat:", !!chat);

  if (!form || !textarea || !chat) {
    console.error("Elementos HTML faltantes: revisa que chat_bot.html tenga .input-area, #chatTextarea y .chat-messages");
    return;
  }

  // Obtener hora actual formato HH:MM
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Crear mensaje y añadir al chat
  function createMessage(text, sender = "bot") {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const timeHtml = `<div class="timestamp">${getCurrentTime()}</div>`;

    if (sender === "bot") {
      message.innerHTML = `
        <div class="avatar" aria-hidden="true">🤖</div>
        <div>
          <div class="bubble">${text}</div>
          ${timeHtml}
        </div>
      `;
    } else {
      message.innerHTML = `
        <div>
          <div class="bubble">${text}</div>
          ${timeHtml}
        </div>
      `;
    }

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
  }

  // Mostrar indicador "escribiendo..."
  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message bot typing";
    typing.innerHTML = `
      <div class="avatar" aria-hidden="true">🤖</div>
      <div class="bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    `;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
    return typing;
  }

  // Respuestas inteligentes simples
  function getBotResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes("nota") || lower.includes("promedio")) {
      return "Para calcular tu promedio, ve a la sección de Notas/Rendimiento e ingresa tus calificaciones y porcentajes.";
    }
    if (lower.includes("calendario") || lower.includes("alarma") || lower.includes("evento")) {
      return "Puedes gestionar tus eventos y alarmas en la sección Calendario/Alarmas del menú.";
    }
    if (lower.includes("asesor") || lower.includes("humano") || lower.includes("persona")) {
      return "Puedo derivarte a un asesor humano. Describe brevemente tu caso y lo enviaré.";
    }
    if (lower.includes("faq") || lower.includes("pregunta") || lower.includes("ayuda")) {
      return "Consulta las Preguntas Frecuentes desde el menú para respuestas rápidas a casos comunes.";
    }
    if (lower.includes("salud")) {
      return "En Salud encontrarás recursos para bienestar y apoyo psicológico si lo requieres.";
    }

    return `Estoy procesando tu mensaje: "${text}" — ¿puedes darme más detalles?`;
  }

  // Envío de mensaje
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;

    createMessage(text, "user");
    textarea.value = "";
    textarea.focus();

    const typing = showTyping();

    // Simular procesamiento y respuesta
    setTimeout(() => {
      typing.remove();
      const reply = getBotResponse(text);
      createMessage(reply, "bot");
    }, 1200);
  });

  // Enviar con Enter (Shift+Enter = nueva línea)
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
