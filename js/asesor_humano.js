    <script>
        const messagesDiv = document.getElementById("messages");
        const userInput = document.getElementById("userInput");
        const sendButton = document.getElementById("sendButton");

        sendButton.addEventListener("click", () => {
            const userMessage = userInput.value;
            if (userMessage.trim() !== "") {
                addMessage("Usuario", userMessage);
                userInput.value = "";
                // Aquí puedes agregar la lógica para procesar el mensaje del usuario
            }
        });

        function addMessage(sender, message) {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
            messagesDiv.appendChild(messageElement);
        }
    </script>
