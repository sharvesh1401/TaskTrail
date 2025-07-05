document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const messageList = document.getElementById('message-list');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');

    // Ensure messages array is available (defined in chat.html)
    // let messages = []; // This would be used if not defined in HTML scope
    // let isFirstApiCall = true; // Same for this flag

    // 1. Chatbox Initialization
    // Do not send any automatic messages on open.

    // Render existing messages[] (if any) inside a scrollable container
    function renderMessages() {
        messageList.innerHTML = ''; // Clear existing messages
        messages.forEach(msg => {
            appendMessageToDOM(msg.role, msg.content, false); // Don't animate existing messages
        });
        scrollToBottom();
    }

    function appendMessageToDOM(role, content, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.textContent = content;
        messageDiv.appendChild(bubbleDiv);

        if (animate) {
            if (role === 'user') {
                messageDiv.classList.add('animate-user-pop');
            } else if (role === 'assistant') {
                messageDiv.classList.add('animate-msg-in');
            }
        }

        messageList.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        messageList.scrollTop = messageList.scrollHeight;
    }

    // Initial render of any existing messages (e.g., from a saved session)
    // For now, `messages` array is initialized as empty in chat.html
    renderMessages();

    // Focus the input field and show placeholder
    // Placeholder is already set in HTML: "Ask TrailGuide anything…"
    chatInput.focus();


    // 2. User Message Handling
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex'; // Or 'block' depending on final styling
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function toggleInputDisabled(disabled) {
        chatInput.disabled = disabled;
        sendButton.disabled = disabled;
        if (!disabled) {
            chatInput.focus();
        }
    }

    async function handleSendMessage() {
        const userMessageContent = chatInput.value.trim();

        if (userMessageContent === '') {
            return; // Do nothing if message is empty
        }

        // Append user's message to messages[]
        messages.push({ role: "user", content: userMessageContent });
        // Trim messages if it grows too large
        if (messages.length > MAX_CONVERSATION_MESSAGES_STORAGE) {
            messages = messages.slice(messages.length - MAX_CONVERSATION_MESSAGES_STORAGE);
        }
        appendMessageToDOM("user", userMessageContent, true); // Animate user message

        chatInput.value = ''; // Clear the input field
        toggleInputDisabled(true); // Disable input and show typing indicator
        showTypingIndicator();

        // Prepare for API call (actual call will be in getAiResponse)
        console.log("User message sent. Preparing for AI response..."); // Placeholder

        // Simulate API call delay for now
        // await new Promise(resolve => setTimeout(resolve, 1500));
        // hideTypingIndicator();
        // appendMessageToDOM("assistant", "This is a simulated AI reply.", true);
        // toggleInputDisabled(false);

        // Call the function to get AI response (to be implemented in next steps)
        await getAiResponse(userMessageContent);
    }

    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line on Enter
            handleSendMessage();
        }
    });

    // --- Placeholder for future implementation steps ---

    const MAX_CONVERSATION_MESSAGES_API = 20; // Max messages to send to API
    const MAX_CONVERSATION_MESSAGES_STORAGE = 20; // Max messages to store in local `messages` array

    // 3. API Communication Logic
    // Global 'currentTasks', 'messages', and 'isFirstApiCall' are available from chat.html scope
    async function getAiResponse(userMessageContent) {
        // Prepare payload
        const payload = {
            tasksContext: currentTasks.map(t => ({
                title: t.title,
                goal: t.goal,
                importance: t.importanceLevel, // Assuming 'importanceLevel' is the correct field name
                status: t.completed ? "completed" : "pending"
            })),
            // Send last 20 messages. Ensure userMessageContent isn't duplicated if already pushed.
            // The 'messages' array already includes the latest user message.
            conversation: messages.slice(-MAX_CONVERSATION_MESSAGES_API),
            userMessage: userMessageContent // The new string from the user
        };

        if (isFirstApiCall) {
            payload.systemPrompt = "You are TrailGuide, an AI assistant for TaskTrail. Use the user's task list context to give concise, actionable replies when asked. Do not loop or re-prompt the user.";
            // isFirstApiCall = false; // Set to false after the first call that successfully sends it.
                                  // This should ideally be set after a successful API call, not before.
        }

        // Task-Aware Hints
        const taskHint = currentTasks.find(t => userMessageContent.toLowerCase().includes(t.title.toLowerCase()));
        if (taskHint) {
            payload.taskHint = { // Send a structured object for the hint
                title: taskHint.title,
                goal: taskHint.goal,
                importance: taskHint.importanceLevel,
                status: taskHint.completed ? "completed" : "pending"
            };
        }

        let aiResponse;
        let success = false;

        try {
            console.log("Attempting API call to /api/groq with payload:", JSON.stringify(payload, null, 2));
            const res = await fetch("/api/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(`Groq API error: ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            aiResponse = json.reply;
            if (!aiResponse) throw new Error("Groq response did not contain a reply.");
            console.log("Groq API success:", aiResponse);
            if (isFirstApiCall) isFirstApiCall = false; // System prompt sent successfully
            success = true;
        } catch (groqError) {
            console.warn("Groq API call failed:", groqError.message, "Falling back to DeepSeek.");
            try {
                // Ensure systemPrompt is included in fallback if the first call failed before sending it
                if (isFirstApiCall && !payload.systemPrompt) {
                     payload.systemPrompt = "You are TrailGuide, an AI assistant for TaskTrail. Use the user's task list context to give concise, actionable replies when asked. Do not loop or re-prompt the user.";
                }
                console.log("Attempting API call to /api/deepseek with payload:", JSON.stringify(payload, null, 2));
                const res2 = await fetch("/api/deepseek", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res2.ok) {
                    throw new Error(`DeepSeek API error: ${res2.status} ${res2.statusText}`);
                }
                const json2 = await res2.json();
                aiResponse = json2.reply;
                if (!aiResponse) throw new Error("DeepSeek response did not contain a reply.");
                console.log("DeepSeek API success:", aiResponse);
                if (isFirstApiCall) isFirstApiCall = false; // System prompt sent successfully via fallback
                success = true;
            } catch (deepseekError) {
                console.error("DeepSeek API call also failed:", deepseekError.message);
                aiResponse = "Sorry, TrailGuide is unavailable. Please try again later."; // Error message
            }
        }

        hideTypingIndicator();
        if (success && aiResponse) {
            messages.push({ role: "assistant", content: aiResponse });
        } else {
            // For errors, the aiResponse is the error message string.
            // Push it with an error flag, or decide if error messages should persist in history.
            // For now, let's add it so it's visible, but it could be excluded from being sent to the API.
            messages.push({ role: "assistant", content: aiResponse, error: true });
        }

        // Trim messages if it grows too large, after adding AI/error response
        if (messages.length > MAX_CONVERSATION_MESSAGES_STORAGE) {
            messages = messages.slice(messages.length - MAX_CONVERSATION_MESSAGES_STORAGE);
        }

        appendMessageToDOM(success ? "assistant" : "error", aiResponse, true);
        toggleInputDisabled(false);
    }

    // Refined appendMessageToDOM to handle error messages styling if needed
    function appendMessageToDOM(role, content, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (role === 'error') {
            messageDiv.classList.add('error-message'); // Special class for error styling
        } else {
            messageDiv.classList.add(`${role}-message`);
        }

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.textContent = content;
        messageDiv.appendChild(bubbleDiv);

        if (animate) {
            if (role === 'user') {
                messageDiv.classList.add('animate-user-pop');
            } else if (role === 'assistant' || role === 'error') { // Animate errors too
                messageDiv.classList.add('animate-msg-in');
            }
        }

        messageList.appendChild(messageDiv);
        scrollToBottom();
    }


    // 4. Render AI Reply / Error (partially handled by getAiResponse and appendMessageToDOM)
    // function handleApiError() will be for more specific UI changes if needed beyond the message

    console.log("Chatbox initialized. User message handling and API logic active. script.js loaded.");
});
