// chat_bot.js
// Versión con roles, umbral de confianza y autoaprendizaje

const LS_CHAT_KEY = 'udem_chat_history';
const LS_LEARNING_KEY = 'udem_learning_data';
const LS_USER_ROLE = 'udem_user_role';

let userRole = localStorage.getItem(LS_USER_ROLE) || 'student';
let chatHistory = JSON.parse(localStorage.getItem(LS_CHAT_KEY) || '[]');
let learningData = JSON.parse(localStorage.getItem(LS_LEARNING_KEY) || '{}');

function getBotResponse(userMessage) {
  // Simular confianza (en producción, usa IA real)
  const confidence = Math.random() * 100;
  document.getElementById('confidenceIndicator').textContent = `Confianza: ${confidence.toFixed(0)}%`;

  // Buscar en datos de aprendizaje
  for (const key in learningData) {
    if (userMessage.toLowerCase().includes(key)) {
      return learningData[key];
    }
  }

  // Respuestas básicas
  if (userMessage.toLowerCase().includes('nota')) return 'Puedes ver tus notas en la sección Notas/Rendimiento.';
  if (userMessage.toLowerCase().includes('horario')) return 'Revisa tu calendario en Calendario/Alarmas.';
  if (confidence > 70) {
    // Escalar a asesor
    if (userRole === 'advisor') {
      return 'Como asesor, puedo ayudarte directamente. ¿Qué necesitas?';
    } else {
      return 'Lo siento, no estoy seguro. Te conecto con un asesor humano.';
    }
  }
  return '¡Hola! ¿En qué más puedo ayudarte?';
}

function addMessage(sender, text) {
  const messages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = `
    <div class="avatar">${sender === 'bot' ? '🤖' : '👤'}</div>
    <div class="bubble">${text}</div>
  `;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

function saveChat(userMessage, botResponse) {
  chatHistory.push({ user: userMessage, bot: botResponse, timestamp: Date.now() });
  localStorage.setItem(LS_CHAT_KEY, JSON.stringify(chatHistory));

  // Autoaprendizaje: guardar respuestas útiles
  if (botResponse.includes('puedes ver') || botResponse.includes('revisa')) {
    learningData[userMessage.toLowerCase()] = botResponse;
    localStorage.setItem(LS_LEARNING_KEY, JSON.stringify(learningData));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('userInput');

  // Cargar historial
  chatHistory.forEach(msg => {
    addMessage('user', msg.user);
    addMessage('bot', msg.bot);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    addMessage('user', userMessage);
    const botResponse = getBotResponse(userMessage);
    addMessage('bot', botResponse);
    saveChat(userMessage, botResponse);
    input.value = '';
  });
});