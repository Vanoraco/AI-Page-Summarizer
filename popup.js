// Popup script for AI Page Summarizer Extension

// Debug logging utility
const DEBUG = true; // Set to false for production
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[AI Summarizer Popup] ${message}`, data || '');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  debugLog('Popup DOM loaded, initializing...');
  // Get DOM elements
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const successState = document.getElementById('successState');
  const initialState = document.getElementById('initialState');

  const errorMessage = document.getElementById('errorMessage');
  const pageTitle = document.getElementById('pageTitle');
  const pageUrl = document.getElementById('pageUrl');
  const summaryText = document.getElementById('summaryText');

  const retryBtn = document.getElementById('retryBtn');
  const copyBtn = document.getElementById('copyBtn');
  const newSummaryBtn = document.getElementById('newSummaryBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Tab elements
  const summaryTab = document.getElementById('summaryTab');
  const chatTab = document.getElementById('chatTab');
  const summaryContent = document.getElementById('summaryContent');
  const chatContent = document.getElementById('chatContent');

  // Chat elements
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');

  // Debug elements
  const debugLink = document.getElementById('debugLink');
  const debugPanel = document.getElementById('debugPanel');
  const closeDebug = document.getElementById('closeDebug');
  const refreshDebug = document.getElementById('refreshDebug');
  const clearStorage = document.getElementById('clearStorage');
  const exportDebug = document.getElementById('exportDebug');
  const debugStatus = document.getElementById('debugStatus');
  const debugStorage = document.getElementById('debugStorage');
  
  // Check if we have content to process
  debugLog('Checking for content to process...');
  const data = await chrome.storage.local.get(['currentContent', 'currentUrl', 'currentTitle', 'isProcessing', 'lastError']);

  debugLog('Storage data retrieved', {
    hasContent: !!data.currentContent,
    isProcessing: data.isProcessing,
    hasError: !!data.lastError,
    contentLength: data.currentContent?.length || 0
  });

  if (data.lastError) {
    debugLog('Found error in storage', data.lastError);
    errorMessage.textContent = data.lastError;
    showState('error');
    // Clear the error after showing it
    chrome.storage.local.remove(['lastError']);
  } else if (data.currentContent && data.isProcessing) {
    // Show loading state and start summarization
    debugLog('Starting summarization process');
    showState('loading');
    await processSummarization(data);
  } else {
    // Show initial state
    debugLog('No content to process, showing initial state');
    showState('initial');
  }
  
  // Event listeners
  retryBtn.addEventListener('click', async () => {
    const retryData = await chrome.storage.local.get(['currentContent', 'currentUrl', 'currentTitle']);
    if (retryData.currentContent) {
      showState('loading');
      await processSummarization(retryData);
    }
  });
  
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summaryText.textContent);
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          Copy
        `;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  });
  
  newSummaryBtn.addEventListener('click', async () => {
    debugLog('New summary requested');

    // Reset bubble state if it was triggered by bubble
    const storageData = await chrome.storage.local.get(['bubbleTriggered', 'bubbleTabId']);
    if (storageData.bubbleTriggered && storageData.bubbleTabId) {
      try {
        await chrome.tabs.sendMessage(storageData.bubbleTabId, {
          action: 'resetBubbleState'
        });
      } catch (error) {
        debugLog('Could not reset bubble state', error);
      }
    }

    showState('initial');
    chrome.storage.local.clear();
  });
  
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Tab switching
  summaryTab.addEventListener('click', () => {
    switchTab('summary');
  });

  chatTab.addEventListener('click', () => {
    switchTab('chat');
  });

  // Chat functionality
  chatInput.addEventListener('input', () => {
    sendChatBtn.disabled = !chatInput.value.trim();
    autoResizeTextarea(chatInput);
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.value.trim()) {
        sendChatMessage();
      }
    }
  });

  sendChatBtn.addEventListener('click', () => {
    if (chatInput.value.trim()) {
      sendChatMessage();
    }
  });

  clearChatBtn.addEventListener('click', () => {
    clearChatHistory();
  });

  // Debug event listeners
  debugLink.addEventListener('click', (e) => {
    e.preventDefault();
    debugLog('Opening debug panel');
    showDebugPanel();
  });

  // Reset bubble state when popup is closed
  window.addEventListener('beforeunload', async () => {
    const storageData = await chrome.storage.local.get(['bubbleTriggered', 'bubbleTabId', 'isProcessing']);

    // Only reset if processing is complete and bubble was triggered
    if (storageData.bubbleTriggered && storageData.bubbleTabId && !storageData.isProcessing) {
      try {
        await chrome.tabs.sendMessage(storageData.bubbleTabId, {
          action: 'resetBubbleState'
        });
        await chrome.storage.local.remove(['bubbleTriggered', 'bubbleTabId']);
      } catch (error) {
        debugLog('Could not reset bubble state on popup close', error);
      }
    }
  });

  closeDebug.addEventListener('click', () => {
    debugLog('Closing debug panel');
    debugPanel.style.display = 'none';
  });

  refreshDebug.addEventListener('click', () => {
    debugLog('Refreshing debug info');
    updateDebugInfo();
  });

  clearStorage.addEventListener('click', async () => {
    debugLog('Clearing storage');
    await chrome.storage.local.clear();
    await chrome.storage.sync.clear();
    updateDebugInfo();
    alert('Storage cleared!');
  });

  exportDebug.addEventListener('click', () => {
    debugLog('Exporting debug info');
    exportDebugInfo();
  });
  
  // Function to show different states
  function showState(state) {
    const states = [loadingState, errorState, successState, initialState];
    states.forEach(s => s.style.display = 'none');
    
    switch (state) {
      case 'loading':
        loadingState.style.display = 'flex';
        break;
      case 'error':
        errorState.style.display = 'flex';
        break;
      case 'success':
        successState.style.display = 'flex';
        break;
      case 'initial':
        initialState.style.display = 'flex';
        break;
    }
  }
  
  // Function to process summarization
  async function processSummarization(data) {
    try {
      // Get API settings
      const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
      
      if (!settings.apiKey) {
        throw new Error('API key not configured. Please set it in the extension settings.');
      }
      
      // Send content for summarization
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'summarize',
          content: data.currentContent,
          apiKey: settings.apiKey,
          provider: settings.provider || 'openai'
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      if (response.success) {
        // Show success state with summary
        pageTitle.textContent = data.currentTitle || 'Untitled Page';
        pageUrl.textContent = data.currentUrl || '';
        summaryText.textContent = response.summary;

        showState('success');

        // Clear processing flag and check if bubble was triggered
        const storageData = await chrome.storage.local.get(['bubbleTriggered', 'bubbleTabId']);
        await chrome.storage.local.set({ isProcessing: false });

        // If summarization was triggered by bubble, notify content script
        if (storageData.bubbleTriggered && storageData.bubbleTabId) {
          try {
            await chrome.tabs.sendMessage(storageData.bubbleTabId, {
              action: 'updateBubbleState',
              state: 'success'
            });
            // Clear bubble flags
            await chrome.storage.local.remove(['bubbleTriggered', 'bubbleTabId']);
          } catch (error) {
            debugLog('Could not update bubble state on success', error);
          }
        }

      } else {
        throw new Error(response.error || 'Failed to generate summary');
      }
      
    } catch (error) {
      console.error('Summarization error:', error);
      errorMessage.textContent = error.message;
      showState('error');

      // Clear processing flag and check if bubble was triggered
      const storageData = await chrome.storage.local.get(['bubbleTriggered', 'bubbleTabId']);
      await chrome.storage.local.set({ isProcessing: false });

      // If summarization was triggered by bubble, notify content script of error
      if (storageData.bubbleTriggered && storageData.bubbleTabId) {
        try {
          await chrome.tabs.sendMessage(storageData.bubbleTabId, {
            action: 'updateBubbleState',
            state: 'error'
          });
          // Clear bubble flags
          await chrome.storage.local.remove(['bubbleTriggered', 'bubbleTabId']);
        } catch (msgError) {
          debugLog('Could not update bubble state on error', msgError);
        }
      }
    }
  }
});

// Function to truncate URL for display
function truncateUrl(url, maxLength = 50) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

// Function to format summary text
function formatSummary(text) {
  // Add basic formatting for better readability
  return text
    .replace(/\. /g, '.\n\n')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

// Debug functions
async function showDebugPanel() {
  debugPanel.style.display = 'block';
  await updateDebugInfo();
}

async function updateDebugInfo() {
  try {
    // Get all storage data
    const localData = await chrome.storage.local.get(null);
    const syncData = await chrome.storage.sync.get(null);

    // Update status
    const manifest = chrome.runtime.getManifest();
    debugStatus.innerHTML = `
      Extension: ${manifest.name} v${manifest.version}<br>
      Manifest: V${manifest.manifest_version}<br>
      Timestamp: ${new Date().toISOString()}<br>
      URL: ${window.location.href}
    `;

    // Update storage display
    const storageInfo = {
      local: localData,
      sync: syncData,
      sizes: {
        local: JSON.stringify(localData).length,
        sync: JSON.stringify(syncData).length
      }
    };

    debugStorage.textContent = JSON.stringify(storageInfo, null, 2);

    debugLog('Debug info updated', storageInfo);

  } catch (error) {
    debugLog('Error updating debug info', error);
    debugStatus.textContent = `Error: ${error.message}`;
    debugStorage.textContent = `Error loading storage: ${error.message}`;
  }
}

async function exportDebugInfo() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      extension: {
        name: chrome.runtime.getManifest().name,
        version: chrome.runtime.getManifest().version
      },
      storage: {
        local: await chrome.storage.local.get(null),
        sync: await chrome.storage.sync.get(null)
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-summarizer-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    debugLog('Debug info exported');

  } catch (error) {
    debugLog('Error exporting debug info', error);
    alert(`Export failed: ${error.message}`);
  }
}

// Tab switching functionality
function switchTab(tabName) {
  const summaryTab = document.getElementById('summaryTab');
  const chatTab = document.getElementById('chatTab');
  const summaryContent = document.getElementById('summaryContent');
  const chatContent = document.getElementById('chatContent');

  // Update tab buttons
  summaryTab.classList.toggle('active', tabName === 'summary');
  chatTab.classList.toggle('active', tabName === 'chat');

  // Update content visibility
  summaryContent.classList.toggle('active', tabName === 'summary');
  chatContent.style.display = tabName === 'chat' ? 'flex' : 'none';

  debugLog(`Switched to ${tabName} tab`);
}

// Chat functionality
let chatHistory = [];

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const message = chatInput.value.trim();

  if (!message) return;

  debugLog('Sending chat message', { message });

  // Check if background script is available
  try {
    await chrome.runtime.sendMessage({ action: 'ping' });
  } catch (error) {
    addChatMessage('assistant', 'Extension background script is not responding. Please try refreshing the page or reloading the extension.');
    return;
  }

  // Clear welcome message if it exists
  const welcomeMessage = chatMessages.querySelector('.chat-welcome');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  // Add user message
  addChatMessage('user', message);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  document.getElementById('sendChatBtn').disabled = true;

  // Show loading indicator
  const loadingElement = addChatLoading();

  try {
    // Get current page content and settings
    let data = await chrome.storage.local.get(['currentContent', 'currentUrl', 'currentTitle']);
    const settings = await chrome.storage.sync.get(['apiKey', 'provider']);

    // If no content is stored, try to extract it from the current page
    if (!data.currentContent) {
      debugLog('No stored content found, extracting from current page...');
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          const extractedData = await chrome.tabs.sendMessage(tab.id, { action: "extractContent" });
          if (extractedData && extractedData.success) {
            data = {
              currentContent: extractedData.content,
              currentUrl: tab.url,
              currentTitle: tab.title
            };
            // Store the extracted content for future use
            await chrome.storage.local.set(data);
            debugLog('Content extracted successfully', { contentLength: data.currentContent?.length || 0 });
          }
        }
      } catch (extractError) {
        debugLog('Failed to extract content', extractError);
        // Continue with empty content - AI can still provide general help
      }
    }

    debugLog('Chat data retrieved', {
      hasContent: !!data.currentContent,
      contentLength: data.currentContent?.length || 0,
      contentPreview: data.currentContent ? data.currentContent.substring(0, 100) + '...' : 'No content',
      hasApiKey: !!settings.apiKey,
      provider: settings.provider,
      pageTitle: data.currentTitle,
      pageUrl: data.currentUrl
    });

    if (!settings.apiKey) {
      throw new Error('API key not configured. Please set it in the extension settings.');
    }

    // Warn user if no content is available
    if (!data.currentContent || data.currentContent.trim().length < 50) {
      debugLog('Warning: Limited or no page content available');
      // Add a helpful message to the chat
      if (!data.currentContent) {
        addChatMessage('assistant', '⚠️ I couldn\'t extract content from this page. You can still ask me general questions, but for page-specific questions, try right-clicking and selecting "Summarize this page" first.');
        loadingElement.remove();
        return;
      }
    }

    // Send chat message to background script with timeout
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timed out. Please try again.'));
      }, 30000); // 30 second timeout

      chrome.runtime.sendMessage({
        action: 'chat',
        message: message,
        chatHistory: chatHistory.slice(-6), // Limit history to last 6 messages to avoid token limits
        pageContent: data.currentContent ? data.currentContent.substring(0, 8000) : '', // Limit content length
        pageUrl: data.currentUrl,
        pageTitle: data.currentTitle,
        apiKey: settings.apiKey,
        provider: settings.provider || 'openai'
      }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          reject(new Error('No response received from background script'));
        } else {
          resolve(response);
        }
      });
    });

    // Remove loading indicator
    loadingElement.remove();

    if (response.success) {
      // Add assistant response
      addChatMessage('assistant', response.reply);

      // Update chat history
      chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.reply }
      );

      debugLog('Chat message sent successfully');
    } else {
      throw new Error(response.error || 'Failed to get chat response');
    }

  } catch (error) {
    debugLog('Chat error', error);
    loadingElement.remove();

    let errorMessage = error.message;

    // Provide more helpful error messages
    if (errorMessage.includes('timed out')) {
      errorMessage = 'The request timed out. Please try again with a shorter message or check your internet connection.';
    } else if (errorMessage.includes('API key')) {
      errorMessage = 'There\'s an issue with your API key. Please check your settings and make sure your API key is valid.';
    } else if (errorMessage.includes('rate limit')) {
      errorMessage = 'You\'ve hit the rate limit. Please wait a moment and try again.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }

    addChatMessage('assistant', `Sorry, I encountered an error: ${errorMessage}`);
  }
}

function addChatMessage(sender, content) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender}`;
  bubble.textContent = content;

  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(time);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addChatLoading() {
  const chatMessages = document.getElementById('chatMessages');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-message assistant';

  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'chat-loading';
  loadingBubble.innerHTML = `
    <span>AI is thinking</span>
    <div class="chat-loading-dots">
      <div class="chat-loading-dot"></div>
      <div class="chat-loading-dot"></div>
      <div class="chat-loading-dot"></div>
    </div>
  `;

  loadingDiv.appendChild(loadingBubble);
  chatMessages.appendChild(loadingDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return loadingDiv;
}

function clearChatHistory() {
  const chatMessages = document.getElementById('chatMessages');
  chatHistory = [];

  // Clear all messages
  chatMessages.innerHTML = `
    <div class="chat-welcome">
      <div class="chat-welcome-icon">💬</div>
      <h4>Start a conversation</h4>
      <p>Ask questions about the current page content, request explanations, or get more details about specific topics.</p>
    </div>
  `;

  debugLog('Chat history cleared');
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
}

// Debug function to test content extraction
async function testContentExtraction() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const result = await chrome.tabs.sendMessage(tab.id, { action: "extractContent" });
      console.log('Content extraction test:', result);
      return result;
    }
  } catch (error) {
    console.error('Content extraction test failed:', error);
    return { success: false, error: error.message };
  }
}

// Make it available globally for debugging
window.testContentExtraction = testContentExtraction;
