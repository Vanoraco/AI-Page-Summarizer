// Content script for AI Page Summarizer Extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    try {
      const content = extractPageContent();
      sendResponse({ success: true, content });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
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
