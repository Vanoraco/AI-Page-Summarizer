// Options page script for AI Page Summarizer Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMessage = document.getElementById('statusMessage');
  const getApiKeyLink = document.getElementById('getApiKeyLink');
  
  // Load saved settings
  await loadSettings();
  
  // Event listeners
  providerSelect.addEventListener('change', updateApiKeyLink);
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testConnection);
  apiKeyInput.addEventListener('input', clearStatus);
  
  // Initialize
  updateApiKeyLink();
  
  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(['provider', 'apiKey']);
      
      if (settings.provider) {
        providerSelect.value = settings.provider;
      }
      
      if (settings.apiKey) {
        apiKeyInput.value = settings.apiKey;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  // Save settings to storage
  async function saveSettings() {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    
    try {
      await chrome.storage.sync.set({
        provider: provider,
        apiKey: apiKey
      });
      
      showStatus('Settings saved successfully!', 'success');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        hideStatus();
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Failed to save settings. Please try again.', 'error');
    }
  }
  
  // Test API connection
  async function testConnection() {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }
    
    // Show testing status
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    showStatus('Testing connection...', 'info');
    
    try {
      const testContent = 'This is a test message to verify the API connection is working properly.';
      
      let response;
      if (provider === 'openai') {
        response = await testOpenAI(apiKey, testContent);
      } else if (provider === 'anthropic') {
        response = await testAnthropic(apiKey, testContent);
      } else if (provider === 'gemini') {
        response = await testGemini(apiKey, testContent);
      }
      
      if (response) {
        showStatus('✅ Connection successful! API is working correctly.', 'success');
      } else {
        showStatus('❌ Connection failed. Please check your API key.', 'error');
      }
      
    } catch (error) {
      console.error('Test connection error:', error);
      showStatus(`❌ Connection failed: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    }
  }
  
  // Test OpenAI API
  async function testOpenAI(apiKey, content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Summarize this in one sentence: ${content}`
          }
        ],
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  // Test Anthropic API
  async function testAnthropic(apiKey, content) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `Summarize this in one sentence: ${content}`
          }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }
    
    const data = await response.json();
    return data.content[0].text;
  }

  // Test Gemini API
  async function testGemini(apiKey, content) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Summarize this in one sentence: ${content}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 50
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google Gemini API request failed');
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Google Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }

  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    
    const eyeIcon = toggleApiKeyBtn.querySelector('svg');
    if (isPassword) {
      // Show eye-off icon
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
      `;
    } else {
      // Show eye icon
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
      `;
    }
  }
  
  // Update API key link based on provider
  function updateApiKeyLink() {
    const provider = providerSelect.value;

    if (provider === 'openai') {
      getApiKeyLink.href = 'https://platform.openai.com/api-keys';
      getApiKeyLink.textContent = 'Get OpenAI API key';
    } else if (provider === 'anthropic') {
      getApiKeyLink.href = 'https://console.anthropic.com/';
      getApiKeyLink.textContent = 'Get Anthropic API key';
    } else if (provider === 'gemini') {
      getApiKeyLink.href = 'https://aistudio.google.com/app/apikey';
      getApiKeyLink.textContent = 'Get Google Gemini API key';
    }
  }
  
  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
  }
  
  // Hide status message
  function hideStatus() {
    statusMessage.style.display = 'none';
  }
  
  // Clear status when user types
  function clearStatus() {
    hideStatus();
  }
});
