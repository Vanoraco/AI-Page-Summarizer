// Content script for AI Page Summarizer Extension

// Global variables for the floating bubble
let floatingBubble = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    try {
      const content = extractPageContent();
      sendResponse({ success: true, content });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === "showFloatingBubble") {
    showFloatingBubble();
    sendResponse({ success: true });
  } else if (request.action === "hideFloatingBubble") {
    hideFloatingBubble();
    sendResponse({ success: true });
  } else if (request.action === "updateBubbleState") {
    updateBubbleState(request.state, request.message);
    sendResponse({ success: true });
  } else if (request.action === "resetBubbleState") {
    resetBubbleState();
    sendResponse({ success: true });
  }
});

// Function to extract meaningful content from the page
function extractPageContent() {
  // Create a clone of the document to avoid modifying the original
  const docClone = document.cloneNode(true);
  
  // Remove unwanted elements
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
  
  // Try to find main content areas in order of preference
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content-body',
    '.story-body',
    '#content',
    '.main-content',
    '.page-content'
  ];
  
  let content = '';
  let contentElement = null;
  
  // Try each selector to find the best content
  for (const selector of contentSelectors) {
    const element = docClone.querySelector(selector);
    if (element) {
      const text = element.innerText || element.textContent;
      if (text && text.trim().length > 200) {
        content = text;
        contentElement = element;
        break;
      }
    }
  }
  
  // If no main content found, try to extract from body but filter out noise
  if (!content || content.trim().length < 200) {
    // Remove more noise elements
    const noiseSelectors = [
      '.cookie-notice', '.newsletter', '.subscription', '.social-media',
      '.breadcrumb', '.tags', '.categories', '.metadata', '.author-bio'
    ];
    
    noiseSelectors.forEach(selector => {
      const elements = docClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    content = docClone.body.innerText || docClone.body.textContent;
  }
  
  // Clean up the content
  content = cleanText(content);
  
  // Validate content quality
  if (!isValidContent(content)) {
    throw new Error('Unable to extract meaningful content from this page');
  }
  
  return content;
}

// Function to clean extracted text
function cleanText(text) {
  if (!text) return '';
  
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
    // Limit length for API efficiency
    .substring(0, 16000);
}

// Function to validate if content is meaningful
function isValidContent(content) {
  if (!content || content.length < 100) {
    return false;
  }
  
  // Check for minimum word count
  const words = content.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 50) {
    return false;
  }
  
  // Check if content is mostly navigation/menu items (short repeated phrases)
  const avgWordLength = content.replace(/\s/g, '').length / words.length;
  if (avgWordLength < 3) {
    return false;
  }
  
  return true;
}

// Function to get page metadata
function getPageMetadata() {
  return {
    title: document.title,
    url: window.location.href,
    description: getMetaContent('description'),
    keywords: getMetaContent('keywords'),
    author: getMetaContent('author'),
    publishDate: getMetaContent('article:published_time') || getMetaContent('date')
  };
}

// Helper function to get meta tag content
function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.getAttribute('content') : null;
}

// Floating bubble functionality
function createFloatingBubble() {
  if (floatingBubble) {
    return floatingBubble;
  }

  // Create the bubble container
  const bubble = document.createElement('div');
  bubble.id = 'ai-summarizer-bubble';
  bubble.innerHTML = `
    <div class="bubble-content">
      <div class="bubble-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="bubble-text">Summarize</div>
      <div class="bubble-close">×</div>
    </div>
    <div class="bubble-tooltip">Click to summarize this page with AI</div>
  `;

  // Add styles
  const styles = `
    #ai-summarizer-bubble {
      position: fixed;
      z-index: 2147483647;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      cursor: pointer;
      user-select: none;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0;
      transform: scale(0.8);
      animation: bubbleAppear 0.5s ease-out forwards;
    }

    @keyframes bubbleAppear {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    #ai-summarizer-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
      cursor: pointer;
    }

    #ai-summarizer-bubble:hover .bubble-content {
      cursor: pointer;
    }

    #ai-summarizer-bubble:hover .bubble-text::after {
      content: " (click to summarize, drag to move)";
      font-size: 10px;
      opacity: 0.8;
      font-weight: normal;
    }

    #ai-summarizer-bubble:active:not(.dragging) {
      transform: scale(0.95);
    }

    #ai-summarizer-bubble.dragging {
      transform: scale(1.1);
      box-shadow: 0 16px 48px rgba(102, 126, 234, 0.5);
      transition: none;
      cursor: grabbing !important;
    }

    #ai-summarizer-bubble.dragging .bubble-content {
      cursor: grabbing !important;
    }

    #ai-summarizer-bubble.dragging .bubble-text::after {
      content: " (dragging...)";
      font-size: 10px;
      opacity: 0.8;
      font-weight: normal;
    }

    .bubble-content {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      gap: 8px;
      position: relative;
      cursor: pointer;
    }

    .bubble-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bubble-text {
      white-space: nowrap;
    }

    .bubble-close {
      margin-left: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }

    .bubble-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .bubble-tooltip {
      position: absolute;
      bottom: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    #ai-summarizer-bubble:hover .bubble-tooltip {
      opacity: 1;
    }

    .bubble-tooltip::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 4px solid rgba(0, 0, 0, 0.8);
    }

    /* Compact mode for smaller screens */
    @media (max-width: 768px) {
      #ai-summarizer-bubble {
        top: 10px;
        right: 10px;
      }

      .bubble-content {
        padding: 10px 16px;
        font-size: 13px;
      }

      .bubble-text {
        display: none;
      }
    }
  `;

  // Add styles to page
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Add event listeners
  setupBubbleEvents(bubble);

  floatingBubble = bubble;
  return bubble;
}

function setupBubbleEvents(bubble) {
  const bubbleContent = bubble.querySelector('.bubble-content');
  const closeButton = bubble.querySelector('.bubble-close');

  // Drag functionality variables
  let startX, startY, initialX, initialY;
  let dragStartTime = 0;
  let hasMoved = false;
  let dragThreshold = 15; // Increased threshold for better drag detection
  let clickTimeout = null;

  // Close button
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    hideFloatingBubble();
  });

  // Separate click handler for better reliability
  bubbleContent.addEventListener('click', (e) => {
    if (e.target === closeButton) {
      return;
    }

    // Only trigger if we haven't moved and aren't currently dragging
    if (!isDragging && !hasMoved) {
      console.log('Click handler triggered');
      e.preventDefault();
      e.stopPropagation();
      triggerSummarization();
    }
  });

  // Mouse events for dragging
  bubbleContent.addEventListener('mousedown', startDrag);

  // Touch events
  bubbleContent.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    if (e.target === closeButton) {
      return;
    }

    // Clear any pending click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Reset drag state
    isDragging = false;
    hasMoved = false;
    dragStartTime = Date.now();

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = bubble.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;

    dragOffset.x = clientX - initialX;
    dragOffset.y = clientY - initialY;

    // Add event listeners
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);

    // Prevent default to avoid text selection and other interference
    e.preventDefault();
  }

  function drag(e) {
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const deltaX = Math.abs(clientX - startX);
    const deltaY = Math.abs(clientY - startY);

    // Only start dragging if moved more than threshold
    if ((deltaX > dragThreshold || deltaY > dragThreshold) && !hasMoved) {
      hasMoved = true;
      isDragging = true;
      bubble.classList.add('dragging');

      // Add visual feedback for dragging
      bubble.style.cursor = 'grabbing';
      console.log('Started dragging - movement detected:', deltaX, deltaY);
    }

    if (isDragging) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // Keep bubble within viewport
      const maxX = window.innerWidth - bubble.offsetWidth;
      const maxY = window.innerHeight - bubble.offsetHeight;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      bubble.style.left = constrainedX + 'px';
      bubble.style.top = constrainedY + 'px';
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';

      e.preventDefault();
    }
  }

  function stopDrag(e) {
    // Remove event listeners
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);

    // Remove dragging visual state
    bubble.classList.remove('dragging');
    bubble.style.cursor = 'pointer';

    // Check if this was a click (not a drag)
    const dragDuration = Date.now() - dragStartTime;
    const deltaX = Math.abs((e.clientX || e.changedTouches?.[0]?.clientX || startX) - startX);
    const deltaY = Math.abs((e.clientY || e.changedTouches?.[0]?.clientY || startY) - startY);

    const wasClick = !hasMoved &&
                     dragDuration < 500 && // Increased time threshold
                     deltaX < dragThreshold &&
                     deltaY < dragThreshold;

    console.log('Drag ended:', {
      hasMoved,
      dragDuration,
      deltaX,
      deltaY,
      wasClick,
      threshold: dragThreshold
    });

    if (wasClick && e.target !== closeButton) {
      // This was a click, trigger summarization with a small delay
      console.log('Detected click on floating bubble');
      clickTimeout = setTimeout(() => {
        if (!isDragging) { // Double-check we're not in the middle of another drag
          triggerSummarization();
        }
      }, 50); // Small delay to ensure drag state is fully reset
    }

    // Reset drag state
    setTimeout(() => {
      isDragging = false;
      hasMoved = false;
    }, 100);
  }
}

function showFloatingBubble() {
  if (!floatingBubble) {
    createFloatingBubble();
  }

  if (!document.body.contains(floatingBubble)) {
    // Set initial position based on settings
    setBubblePosition();
    document.body.appendChild(floatingBubble);
  }

  // Store bubble visibility preference
  try {
    chrome.storage.local.set({ bubbleVisible: true });
  } catch (error) {
    console.log('Could not store bubble preference:', error);
  }
}

function setBubblePosition() {
  if (!floatingBubble) return;

  try {
    chrome.storage.sync.get(['bubblePosition'], (result) => {
      const position = result.bubblePosition || 'top-right';

      // Reset all position styles
      floatingBubble.style.top = '';
      floatingBubble.style.bottom = '';
      floatingBubble.style.left = '';
      floatingBubble.style.right = '';

      switch (position) {
        case 'top-left':
          floatingBubble.style.top = '20px';
          floatingBubble.style.left = '20px';
          break;
        case 'top-right':
          floatingBubble.style.top = '20px';
          floatingBubble.style.right = '20px';
          break;
        case 'bottom-left':
          floatingBubble.style.bottom = '20px';
          floatingBubble.style.left = '20px';
          break;
        case 'bottom-right':
          floatingBubble.style.bottom = '20px';
          floatingBubble.style.right = '20px';
          break;
        default:
          floatingBubble.style.top = '20px';
          floatingBubble.style.right = '20px';
      }
    });
  } catch (error) {
    // Default position if storage is not available
    floatingBubble.style.top = '20px';
    floatingBubble.style.right = '20px';
  }
}

function hideFloatingBubble() {
  if (floatingBubble && document.body.contains(floatingBubble)) {
    floatingBubble.style.animation = 'bubbleDisappear 0.3s ease-out forwards';
    setTimeout(() => {
      if (document.body.contains(floatingBubble)) {
        document.body.removeChild(floatingBubble);
      }
    }, 300);
  }

  // Store bubble visibility preference
  try {
    chrome.storage.local.set({ bubbleVisible: false });
  } catch (error) {
    console.log('Could not store bubble preference:', error);
  }
}

function triggerSummarization() {
  console.log('Floating bubble clicked - triggering summarization');

  // Add visual feedback
  if (floatingBubble) {
    const bubbleText = floatingBubble.querySelector('.bubble-text');

    // Change text and add visual feedback
    bubbleText.textContent = 'Processing...';
    floatingBubble.style.transform = 'scale(0.9)';
    floatingBubble.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';

    setTimeout(() => {
      floatingBubble.style.transform = '';
    }, 150);
  }

  // Send message to background script to trigger summarization
  chrome.runtime.sendMessage({ action: 'triggerSummarization' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error triggering summarization:', chrome.runtime.lastError);
      // Reset bubble state on error
      resetBubbleState();
    } else {
      console.log('Summarization triggered successfully:', response);
    }
  });
}

// Function to update bubble state
function updateBubbleState(state, message) {
  if (!floatingBubble) return;

  const bubbleText = floatingBubble.querySelector('.bubble-text');

  switch (state) {
    case 'processing':
      bubbleText.textContent = 'Processing...';
      floatingBubble.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      break;
    case 'success':
      bubbleText.textContent = 'Complete!';
      floatingBubble.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      // Auto-reset after 2 seconds
      setTimeout(resetBubbleState, 2000);
      break;
    case 'error':
      bubbleText.textContent = 'Error';
      floatingBubble.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      // Auto-reset after 3 seconds
      setTimeout(resetBubbleState, 3000);
      break;
    default:
      resetBubbleState();
  }
}

// Function to reset bubble to default state
function resetBubbleState() {
  if (!floatingBubble) return;

  const bubbleText = floatingBubble.querySelector('.bubble-text');
  bubbleText.textContent = 'Summarize';
  floatingBubble.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  console.log('Bubble state reset to default');
}

// Add disappear animation
const disappearKeyframes = `
  @keyframes bubbleDisappear {
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
`;

// Initialize bubble on page load if enabled
document.addEventListener('DOMContentLoaded', () => {
  initializeBubble();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBubble);
} else {
  initializeBubble();
}

function initializeBubble() {
  try {
    chrome.storage.sync.get(['showFloatingBubble'], (result) => {
      const showBubble = result.showFloatingBubble !== false; // Default to true
      if (showBubble) {
        setTimeout(showFloatingBubble, 1000);
      }
    });
  } catch (error) {
    // Show bubble by default if storage is not available
    setTimeout(showFloatingBubble, 1000);
  }
}
