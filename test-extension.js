// Test script for AI Page Summarizer Extension
// Run this in the browser console to test various functionality

class ExtensionTester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  // Add a test
  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Extension Tests...\n');
    
    for (const test of this.tests) {
      try {
        console.log(`⏳ Running: ${test.name}`);
        const result = await test.testFunction();
        this.results.push({ name: test.name, status: 'PASS', result });
        console.log(`✅ PASS: ${test.name}`, result);
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ FAIL: ${test.name}`, error.message);
      }
      console.log(''); // Empty line for readability
    }
    
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log('📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }
  }
}

// Create tester instance
const tester = new ExtensionTester();

// Test 1: Extension Loading
tester.addTest('Extension Loading', async () => {
  if (typeof chrome === 'undefined') {
    throw new Error('Chrome extension APIs not available');
  }
  
  if (!chrome.runtime || !chrome.runtime.getManifest) {
    throw new Error('Chrome runtime API not available');
  }
  
  const manifest = chrome.runtime.getManifest();
  return {
    name: manifest.name,
    version: manifest.version,
    manifestVersion: manifest.manifest_version
  };
});

// Test 2: Storage API
tester.addTest('Storage API', async () => {
  const testData = { testKey: 'testValue', timestamp: Date.now() };
  
  // Test local storage
  await chrome.storage.local.set(testData);
  const retrieved = await chrome.storage.local.get('testKey');
  
  if (retrieved.testKey !== testData.testKey) {
    throw new Error('Local storage test failed');
  }
  
  // Clean up
  await chrome.storage.local.remove('testKey');
  
  return { localStorageWorking: true };
});

// Test 3: Content Extraction
tester.addTest('Content Extraction', async () => {
  // Test the content extraction function
  const testContent = document.body.innerText || document.body.textContent;
  
  if (!testContent || testContent.length < 10) {
    throw new Error('Unable to extract content from current page');
  }
  
  return {
    contentLength: testContent.length,
    hasContent: true,
    firstWords: testContent.substring(0, 50) + '...'
  };
});

// Test 4: Context Menu (if available)
tester.addTest('Context Menu API', async () => {
  if (!chrome.contextMenus) {
    throw new Error('Context menu API not available (expected in content script)');
  }
  
  return { contextMenuApiAvailable: true };
});

// Test 5: Message Passing
tester.addTest('Message Passing', async () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Message passing timeout'));
    }, 5000);
    
    chrome.runtime.sendMessage({ action: 'test', data: 'ping' }, (response) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve({ messagePassingWorking: true, response });
      }
    });
  });
});

// Test 6: API Key Validation
tester.addTest('API Key Validation', async () => {
  const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
  
  return {
    hasApiKey: !!settings.apiKey,
    provider: settings.provider || 'not set',
    apiKeyLength: settings.apiKey ? settings.apiKey.length : 0
  };
});

// Test 7: Extension Permissions
tester.addTest('Extension Permissions', async () => {
  const manifest = chrome.runtime.getManifest();
  const permissions = manifest.permissions || [];
  const hostPermissions = manifest.host_permissions || [];
  
  const requiredPermissions = ['contextMenus', 'activeTab', 'storage', 'scripting'];
  const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
  
  if (missingPermissions.length > 0) {
    throw new Error(`Missing permissions: ${missingPermissions.join(', ')}`);
  }
  
  return {
    permissions,
    hostPermissions,
    allRequiredPermissionsPresent: true
  };
});

// Utility function to test content extraction on current page
function testContentExtractionHere() {
  console.log('🔍 Testing content extraction on current page...');
  
  try {
    // Simulate the extraction logic from content.js
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
    let foundSelector = null;
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.innerText || element.textContent;
        if (content && content.trim().length > 100) {
          foundSelector = selector;
          break;
        }
      }
    }
    
    if (!content || content.trim().length < 100) {
      content = document.body.innerText || document.body.textContent;
      foundSelector = 'body (fallback)';
    }
    
    const cleanContent = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log('✅ Content extraction results:');
    console.log(`📄 Selector used: ${foundSelector}`);
    console.log(`📏 Content length: ${cleanContent.length} characters`);
    console.log(`📝 Word count: ${cleanContent.split(/\s+/).length} words`);
    console.log(`🔤 First 200 chars: ${cleanContent.substring(0, 200)}...`);
    
    return {
      success: true,
      selector: foundSelector,
      length: cleanContent.length,
      wordCount: cleanContent.split(/\s+/).length,
      preview: cleanContent.substring(0, 200)
    };
    
  } catch (error) {
    console.error('❌ Content extraction failed:', error);
    return { success: false, error: error.message };
  }
}

// Utility function to simulate API call
async function testApiCall(provider = 'openai', testApiKey = null) {
  console.log(`🔗 Testing ${provider} API call...`);
  
  if (!testApiKey) {
    const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
    testApiKey = settings.apiKey;
    provider = settings.provider || provider;
  }
  
  if (!testApiKey) {
    console.log('❌ No API key found. Please set one in extension settings.');
    return { success: false, error: 'No API key' };
  }
  
  const testContent = 'This is a test message to verify the API connection is working properly.';
  
  try {
    let response;
    
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Summarize: ${testContent}` }],
          max_tokens: 50
        })
      });
    } else if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': testApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 50,
          messages: [{ role: 'user', content: `Summarize: ${testContent}` }]
        })
      });
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API call successful!');
    console.log('📝 Response:', data);
    
    return { success: true, response: data };
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    return { success: false, error: error.message };
  }
}

// Export functions for manual testing
window.ExtensionTester = {
  runAllTests: () => tester.runAllTests(),
  testContentExtraction: testContentExtractionHere,
  testApiCall: testApiCall,
  
  // Quick test commands
  quickTest: async () => {
    console.log('🚀 Running quick extension test...');
    await testContentExtractionHere();
    const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
    if (settings.apiKey) {
      await testApiCall();
    } else {
      console.log('⚠️ No API key set - skipping API test');
    }
  }
};

console.log('🧪 Extension Tester Loaded!');
console.log('📋 Available commands:');
console.log('  - ExtensionTester.runAllTests() - Run all tests');
console.log('  - ExtensionTester.testContentExtraction() - Test content extraction');
console.log('  - ExtensionTester.testApiCall() - Test API connection');
console.log('  - ExtensionTester.quickTest() - Run quick tests');
