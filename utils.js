// Utility functions for AI Page Summarizer Extension

// Text processing utilities
const TextUtils = {
  // Clean and normalize text content
  cleanText(text) {
    if (!text) return '';
    
    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Remove leading/trailing whitespace
      .trim();
  },
  
  // Extract meaningful sentences from text
  extractSentences(text) {
    if (!text) return [];
    
    // Simple sentence splitting (can be improved with NLP libraries)
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
    
    return sentences;
  },
  
  // Calculate reading time estimate
  getReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  },
  
  // Truncate text to specified length
  truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },
  
  // Count words in text
  wordCount(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  },
  
  // Estimate token count (rough approximation)
  estimateTokens(text) {
    if (!text) return 0;
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
};

// Content extraction utilities
const ContentUtils = {
  // Check if element is likely to contain main content
  isContentElement(element) {
    const contentTags = ['article', 'main', 'section', 'div', 'p'];
    const contentClasses = [
      'content', 'post', 'article', 'story', 'entry',
      'main', 'body', 'text', 'description'
    ];
    const contentIds = [
      'content', 'main', 'article', 'post', 'story'
    ];
    
    const tagName = element.tagName.toLowerCase();
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    // Check tag name
    if (contentTags.includes(tagName)) return true;
    
    // Check class names
    if (contentClasses.some(cls => className.includes(cls))) return true;
    
    // Check ID
    if (contentIds.some(contentId => id.includes(contentId))) return true;
    
    return false;
  },
  
  // Check if element should be excluded
  isExcludedElement(element) {
    const excludedTags = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      'iframe', 'object', 'embed', 'form', 'button'
    ];
    const excludedClasses = [
      'nav', 'menu', 'sidebar', 'advertisement', 'ads',
      'social', 'share', 'comment', 'related', 'popup',
      'modal', 'overlay', 'banner', 'cookie'
    ];
    const excludedRoles = [
      'navigation', 'banner', 'complementary', 'contentinfo'
    ];
    
    const tagName = element.tagName.toLowerCase();
    const className = element.className.toLowerCase();
    const role = element.getAttribute('role');
    
    // Check tag name
    if (excludedTags.includes(tagName)) return true;
    
    // Check class names
    if (excludedClasses.some(cls => className.includes(cls))) return true;
    
    // Check role
    if (role && excludedRoles.includes(role.toLowerCase())) return true;
    
    return false;
  },
  
  // Get text density (text length / element size)
  getTextDensity(element) {
    const text = element.textContent || '';
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    
    if (area === 0) return 0;
    return text.length / area;
  }
};

// API utilities
const APIUtils = {
  // Validate API key format
  validateApiKey(apiKey, provider) {
    if (!apiKey || typeof apiKey !== 'string') return false;

    switch (provider) {
      case 'openai':
        // OpenAI keys start with 'sk-'
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'anthropic':
        // Anthropic keys start with 'sk-ant-'
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'gemini':
        // Gemini keys are typically 39 characters long
        return apiKey.length >= 30 && apiKey.length <= 50;
      default:
        return apiKey.length > 10;
    }
  },
  
  // Calculate estimated cost for API call
  estimateCost(tokenCount, provider) {
    const costs = {
      openai: {
        input: 0.0015 / 1000,  // $0.0015 per 1K tokens
        output: 0.002 / 1000   // $0.002 per 1K tokens
      },
      anthropic: {
        input: 0.25 / 1000000,   // $0.25 per 1M tokens
        output: 1.25 / 1000000   // $1.25 per 1M tokens
      },
      gemini: {
        input: 0.075 / 1000000,  // $0.075 per 1M tokens
        output: 0.30 / 1000000   // $0.30 per 1M tokens
      }
    };
    
    const providerCosts = costs[provider];
    if (!providerCosts) return null;
    
    // Estimate output tokens as 20% of input
    const outputTokens = Math.ceil(tokenCount * 0.2);
    const inputCost = tokenCount * providerCosts.input;
    const outputCost = outputTokens * providerCosts.output;
    
    return {
      total: inputCost + outputCost,
      input: inputCost,
      output: outputCost,
      inputTokens: tokenCount,
      outputTokens: outputTokens
    };
  }
};

// Storage utilities
const StorageUtils = {
  // Get settings with defaults
  async getSettings() {
    const defaults = {
      provider: 'openai',
      apiKey: '',
      maxTokens: 200,
      temperature: 0.3
    };
    
    try {
      const stored = await chrome.storage.sync.get(Object.keys(defaults));
      return { ...defaults, ...stored };
    } catch (error) {
      console.error('Error getting settings:', error);
      return defaults;
    }
  },
  
  // Save settings
  async saveSettings(settings) {
    try {
      await chrome.storage.sync.set(settings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },
  
  // Clear all stored data
  async clearAll() {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

// Error handling utilities
const ErrorUtils = {
  // Parse API error responses
  parseApiError(error, provider) {
    if (typeof error === 'string') return error;
    
    // Common error patterns
    const errorPatterns = {
      401: 'Invalid API key. Please check your API key in settings.',
      403: 'Access forbidden. Please check your API key permissions.',
      429: 'Rate limit exceeded. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.'
    };
    
    if (error.status && errorPatterns[error.status]) {
      return errorPatterns[error.status];
    }
    
    if (error.message) return error.message;
    
    return `Unknown error occurred with ${provider} API`;
  },
  
  // Log error with context
  logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      error: error.message || error,
      stack: error.stack
    };
    
    console.error('AI Summarizer Error:', errorInfo);
    
    // Could be extended to send to error tracking service
    return errorInfo;
  }
};

// Export utilities for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TextUtils,
    ContentUtils,
    APIUtils,
    StorageUtils,
    ErrorUtils
  };
}
