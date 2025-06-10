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
  
  newSummaryBtn.addEventListener('click', () => {
    showState('initial');
    chrome.storage.local.clear();
  });
  
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Debug event listeners
  debugLink.addEventListener('click', (e) => {
    e.preventDefault();
    debugLog('Opening debug panel');
    showDebugPanel();
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
        
        // Clear processing flag
        await chrome.storage.local.set({ isProcessing: false });
        
      } else {
        throw new Error(response.error || 'Failed to generate summary');
      }
      
    } catch (error) {
      console.error('Summarization error:', error);
      errorMessage.textContent = error.message;
      showState('error');
      
      // Clear processing flag
      await chrome.storage.local.set({ isProcessing: false });
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
