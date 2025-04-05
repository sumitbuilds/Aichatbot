document.addEventListener('DOMContentLoaded', function() {
    const customSelect = document.querySelector('.custom-select');
    const selectedOption = customSelect.querySelector('.selected-option');
    const options = customSelect.querySelector('.options');
    const togglableButtons = document.querySelectorAll('.search-button, .reason-button, .mic-button');
    const plusBtn = document.getElementById('plusBtn');
    const fileInput = document.getElementById('fileInput');
    const searchButton = document.querySelector('.search-button');
    const uploadButton = document.querySelector('.upload-button');
    const messageInput = document.getElementById('messageInput');
    const conversationDiv = document.getElementById('conversation');
    const headerContainer = document.querySelector('.header-container');
    const conversationContainer = document.querySelector('.conversation-container');

    let selectedAiName = selectedOption.querySelector('.model-version').textContent;
    let firstMessageSent = false;

    const apiKeys = {
        'Gemini 2.0 pro': {
            key: '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',
            model: 'google/gemini-2.0-flash-thinking-exp:free',
            supportsImage: true
        },
        'Gemini 2.0 Flash': {
            key: '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',
            model: 'google/gemini-2.0-flash-thinking-exp:free',
            supportsImage: true
        },
        'DeepSeek: V3': {
            key: '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',
            model: 'deepseek/deepseek-v3:free',
            supportsImage: false
        },
        'DeepSeek: R1': {
            key: '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',
            model: 'deepseek/deepseek-r1:free',
            supportsImage: false
        },
        'GPT-4.5': {
            key: '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',
            model: 'openai/gpt-4o-mini',
            supportsImage: true
        },
        'Gemini Pro 2.5': {
            key: 'sk-or-v1-e1270834d345e9729fb36ca505716dd4ed874abab187',
            model: 'google/gemini-2.5-pro-exp-02-05:free',
            supportsImage: true
        },
        'Meta:Liama': {
            key: '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',
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            supportsImage: false
        },
        'Grok-2': {
            key: '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',
            model: 'XAI:Grok 2',
            supportsImage: false
        },
        'Sonar': null
    };

    // Toggle dropdown
    selectedOption.addEventListener('click', function(event) {
        event.stopPropagation();
        customSelect.classList.toggle('open');
    });

    options.addEventListener('click', function(event) {
        let option = event.target.closest('.option');
        if (option) {
            const aiName = option.querySelector('.ai-name').textContent;
            const modelVersion = option.querySelector('.model-version').textContent;
            selectedOption.querySelector('.ai-name').textContent = aiName;
            selectedOption.querySelector('.model-version').textContent = modelVersion;
            selectedAiName = modelVersion;
            customSelect.classList.remove('open');
        }
    });

    document.addEventListener('click', function() {
        customSelect.classList.remove('open');
    });

    // Toggle active state for buttons
    togglableButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // Trigger file input on plus button click
    plusBtn.addEventListener('click', () => {
        fileInput.click();
    });

    let selectedFile;
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        if (files.length > 0) {
            selectedFile = files[0];
            console.log('Selected file:', selectedFile.name);
        } else {
            selectedFile = null;
        }
    });

    // Function to add a message to the conversation
    function addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.textContent = message;
        } else {
            messageDiv.classList.add('ai-message');
            const aiNameDiv = document.createElement('div');
            aiNameDiv.classList.add('ai-name-display');
            const selectedAiDisplayName = selectedOption.querySelector('.ai-name').textContent;
            aiNameDiv.textContent = selectedAiDisplayName;
            const aiResponseDiv = document.createElement('div');
            aiResponseDiv.classList.add('ai-response-div');
            messageDiv.appendChild(aiNameDiv);
            messageDiv.appendChild(aiResponseDiv);
        }
        conversationDiv.appendChild(messageDiv);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
        return messageDiv;
    }

    // Function to display text with a typing effect for plain text (not used with markdown)
    function displayTypingEffect(text, targetElement, index = 0) {
        if (index < text.length) {
            targetElement.textContent += text.charAt(index);
            index++;
            setTimeout(() => displayTypingEffect(text, targetElement, index), 10);
        }
    }

    // New function: Parse simple markdown formatting into HTML
    function parseMarkdown(text) {
        return text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // New function: Display HTML with a typing effect (by element)
    function displayTypingEffectHTML(htmlContent, targetElement) {
        targetElement.innerHTML = ''; // Clear the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const elements = Array.from(tempDiv.childNodes);
        function typeNextElement(i) {
            if (i >= elements.length) return;
            // Clone and append each element gradually
            const el = elements[i].cloneNode(true);
            targetElement.appendChild(el);
            setTimeout(() => typeNextElement(i + 1), 50);
        }
        typeNextElement(0);
    }

    // Event listener for the Search button (initial UI change)
    searchButton.addEventListener('click', () => {
        if (!firstMessageSent) {
            headerContainer.style.display = 'none';
            conversationContainer.style.marginTop = '20px';
            firstMessageSent = true;
        }
    });

    // Event listener for the Upload button (sending the message to OpenRouter)
    uploadButton.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            const messageDiv = addMessage('user', messageText);
            messageInput.value = '';

            const selectedModelInfo = apiKeys[selectedAiName];

            if (selectedModelInfo && selectedModelInfo.key) {
                const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
                const headers = {
                    "Authorization": `Bearer ${selectedModelInfo.key}`,
                    "HTTP-Referer": "<YOUR_SITE_URL>", // Replace with your site URL
                    "X-Title": "<YOUR_SITE_NAME>", // Replace with your site name
                    "Content-Type": "application/json"
                };

                const requestBody = {
                    "model": selectedModelInfo.model,
                    "messages": [{ "role": "user", "content": messageText }]
                };

                if (selectedModelInfo.supportsImage && selectedFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64Image = reader.result.split(',')[1];
                        requestBody.messages[0].content = [
                            { type: "text", text: messageText },
                            { type: "image_url", image_url: { url: `data:${selectedFile.type};base64,${base64Image}` } }
                        ];
                        fetchAiResponse(apiUrl, headers, requestBody, messageDiv);
                    };
                    reader.onerror = (error) => {
                        console.error("Error reading file:", error);
                        addMessage('ai', 'Error: Could not read the image file.');
                    };
                    reader.readAsDataURL(selectedFile);
                } else {
                    fetchAiResponse(apiUrl, headers, requestBody, messageDiv);
                }

            } else if (selectedAiName === 'Sonar') {
                addMessage('ai', 'Error: API key not available for Sonar.');
            } else {
                addMessage('ai', `Error: Could not find API key for the model: ${selectedAiName}. Please ensure the model name in the dropdown matches a key in the API keys configuration.`);
            }
        }
    });

    function fetchAiResponse(apiUrl, headers, requestBody, userMessageDiv) {
        const aiMessageDiv = addMessage('ai', ' ');
        const responseTarget = aiMessageDiv.querySelector('.ai-response-div');

        // Start "thinking" animation (three dot animation)
        let dots = 0;
        const thinkingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            responseTarget.textContent = 'Thinking' + '.'.repeat(dots);
        }, 500);

        fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                console.error('OpenRouter API Error:', response.status, response.statusText);
                return response.json().then(errData => {
                    throw new Error(`OpenRouter API Error: ${response.status} - ${response.statusText} - ${errData?.error?.message || 'No detailed error message'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            clearInterval(thinkingInterval);
            responseTarget.textContent = '';
            if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                const rawText = data.choices[0].message.content;
                const formattedHTML = parseMarkdown(rawText);
                displayTypingEffectHTML(formattedHTML, responseTarget);
            } else if (data && data.error && data.error.message) {
                responseTarget.textContent = `Error from AI: ${data.error.message}`;
            } else {
                responseTarget.textContent = 'Error: Could not get a valid response from the AI.';
            }
        })
        .catch(error => {
            clearInterval(thinkingInterval);
            responseTarget.textContent = `Error communicating with the AI service: ${error.message}`;
        });
    }

    // Optional: Send message when Enter key is pressed
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            if (!firstMessageSent) {
                headerContainer.style.display = 'none';
                firstMessageSent = true;
            }
            uploadButton.click();
            event.preventDefault();
        }
    });
});
