// Background script for AI Page Summarizer Extension

// Debug logging utility
const DEBUG = true; // Set to false for production
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[AI Summarizer Background] ${message}`, data || '');
  }
}

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed, creating context menu');

  chrome.contextMenus.create({
    id: "summarize-page",
    title: "Summarize this page",
    contexts: ["page", "selection"]
  });

  debugLog('Context menu created successfully');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarize-page") {
    debugLog('Context menu clicked', { tabId: tab.id, url: tab.url });

    try {
      // Inject content script if needed and extract text
      debugLog('Injecting content script to extract page content');

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      });

      const pageContent = results[0].result;
      debugLog('Content extracted', {
        contentLength: pageContent?.length || 0,
        hasContent: !!pageContent
      });

      if (!pageContent || pageContent.trim().length === 0) {
        debugLog('No content extracted, showing error badge');
        chrome.action.setBadgeText({ text: "!" });

        // Store error info
        await chrome.storage.local.set({
          lastError: 'No content could be extracted from this page',
          errorTimestamp: Date.now()
        });
        return;
      }

      // Store the content and trigger popup
      debugLog('Storing content and preparing for summarization');
      await chrome.storage.local.set({
        currentContent: pageContent,
        currentUrl: tab.url,
        currentTitle: tab.title,
        isProcessing: true,
        extractedAt: Date.now()
      });

      // Set badge to indicate processing
      chrome.action.setBadgeText({ text: "..." });

      // Try to open popup - this may not work in all contexts
      try {
        chrome.action.openPopup();
        debugLog('Popup opened, ready for summarization');
      } catch (popupError) {
        debugLog('Could not auto-open popup, user needs to click extension icon', popupError);
        // Set a more obvious badge to indicate user should click
        chrome.action.setBadgeText({ text: "📄" });
      }

    } catch (error) {
      debugLog('Error in context menu handler', error);
      console.error("Error extracting content:", error);
      chrome.action.setBadgeText({ text: "!" });

      // Store detailed error info
      await chrome.storage.local.set({
        lastError: error.message || 'Unknown error occurred',
        errorTimestamp: Date.now(),
        errorStack: error.stack
      });
    }
  }
});

// Function to extract page content (injected into page) - NON-DESTRUCTIVE VERSION
function extractPageContent() {
  // Create a clone of the document to avoid modifying the original
  const docClone = document.cloneNode(true);

  // Remove unwanted elements from the CLONE only
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.sidebar', '.menu', '.navigation',
    '.social-share', '.comments', '.related-posts', '.popup',
    '[role="banner"]', '[role="navigation"]', '[role="complementary"]'
  ];

  unwantedSelectors.forEach(selector => {
    const elements = docClone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Try to find main content areas in the CLONE
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '#content',
    '.main-content'
  ];

  let content = '';

  // Try each selector to find main content in the CLONE
  for (const selector of contentSelectors) {
    const element = docClone.querySelector(selector);
    if (element) {
      content = element.innerText || element.textContent;
      if (content && content.trim().length > 100) {
        break;
      }
    }
  }

  // Fallback to body content if no main content found
  if (!content || content.trim().length < 100) {
    content = docClone.body.innerText || docClone.body.textContent;
  }

  // Clean up the content
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Limit content length (approximately 4000 tokens for GPT)
  if (content.length > 16000) {
    content = content.substring(0, 16000) + '...';
  }

  return content;
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    debugLog('Received summarization request', {
      contentLength: request.content?.length || 0,
      provider: request.provider,
      hasApiKey: !!request.apiKey
    });

    summarizeContent(request.content, request.apiKey, request.provider)
      .then(summary => {
        debugLog('Summarization successful', { summaryLength: summary?.length || 0 });
        sendResponse({ success: true, summary });
        chrome.action.setBadgeText({ text: "" });
      })
      .catch(error => {
        debugLog('Summarization failed', error);
        sendResponse({ success: false, error: error.message });
        chrome.action.setBadgeText({ text: "!" });
      });
    return true; // Keep message channel open for async response
  }

  // Handle debug info requests
  if (request.action === "getDebugInfo") {
    chrome.storage.local.get(null).then(data => {
      sendResponse({ success: true, debugInfo: data });
    });
    return true;
  }
});

// Function to summarize content using AI API
async function summarizeContent(content, apiKey, provider = 'openai') {
  debugLog('Starting summarization', { provider, contentLength: content?.length });

  if (!apiKey) {
    throw new Error('API key not configured. Please set it in the extension options.');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for summarization');
  }

  try {
    let summary;
    if (provider === 'openai') {
      summary = await summarizeWithOpenAI(content, apiKey);
    } else if (provider === 'anthropic') {
      summary = await summarizeWithAnthropic(content, apiKey);
    } else if (provider === 'gemini') {
      summary = await summarizeWithGemini(content, apiKey);
    } else {
      throw new Error('Unsupported AI provider');
    }

    debugLog('Summarization completed successfully');
    return summary;
  } catch (error) {
    debugLog('Summarization error', error);
    throw error;
  }
}

// OpenAI API integration
async function summarizeWithOpenAI(content, apiKey) {
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
          role: 'system',
          content: 'You are a helpful assistant that creates concise, informative summaries of web page content. Focus on the main points and key information. Keep summaries between 3-5 sentences.'
        },
        {
          role: 'user',
          content: `Please summarize the following webpage content:\n\n${content}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get summary from OpenAI');
  }
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Anthropic API integration
async function summarizeWithAnthropic(content, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Please create a concise summary of the following webpage content in 3-5 sentences, focusing on the main points and key information:\n\n${content}`
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get summary from Anthropic');
  }
  
  const data = await response.json();
  return data.content[0].text.trim();
}

// Google Gemini API integration
async function summarizeWithGemini(content, apiKey) {
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
              text: `Please create a concise summary of the following webpage content in 3-5 sentences, focusing on the main points and key information:\n\n${content}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get summary from Google Gemini');
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Google Gemini');
  }

  return data.candidates[0].content.parts[0].text.trim();
}
