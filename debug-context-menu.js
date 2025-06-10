// Debug Context Menu Issues
// Run this in the extension background console to test context menu functionality

console.log('🔧 Context Menu Debug Tool Loaded');

// Test 1: Check if context menu exists
async function checkContextMenu() {
  console.log('🔍 Checking context menu...');
  
  try {
    // Try to remove existing menu and recreate it
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "summarize-page",
        title: "Summarize this page",
        contexts: ["page", "selection"]
      });
      console.log('✅ Context menu recreated successfully');
    });
  } catch (error) {
    console.log('❌ Context menu error:', error);
  }
}

// Test 2: Simulate context menu click
async function simulateContextMenuClick() {
  console.log('🧪 Simulating context menu click...');
  
  try {
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      console.log('❌ No active tab found');
      return;
    }
    
    const tab = tabs[0];
    console.log('📄 Active tab:', tab.url);
    
    // Test content extraction
    console.log('🔍 Testing content extraction...');
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: testContentExtraction
    });
    
    const content = results[0].result;
    console.log('📝 Extracted content:', {
      length: content?.length || 0,
      preview: content?.substring(0, 100) + '...' || 'No content'
    });
    
    if (content && content.length > 0) {
      console.log('✅ Content extraction successful');
      
      // Store content
      await chrome.storage.local.set({
        currentContent: content,
        currentUrl: tab.url,
        currentTitle: tab.title,
        isProcessing: true,
        debugTest: true
      });
      
      console.log('✅ Content stored successfully');
      console.log('💡 Now click the extension icon to see the popup');
      
      // Set badge
      chrome.action.setBadgeText({ text: "📄" });
      chrome.action.setBadgeColor({ color: "#00aa00" });
      
    } else {
      console.log('❌ No content extracted');
    }
    
  } catch (error) {
    console.log('❌ Simulation error:', error);
  }
}

// Test content extraction function (to be injected)
function testContentExtraction() {
  console.log('🔍 Testing content extraction on page...');
  
  try {
    // Create a clone to avoid modifying the original page
    const docClone = document.cloneNode(true);
    
    // Remove unwanted elements from clone
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.menu'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = docClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Try to find main content
    const contentSelectors = [
      'article', '[role="main"]', 'main', '.content',
      '.post-content', '.entry-content', '#content'
    ];
    
    let content = '';
    
    for (const selector of contentSelectors) {
      const element = docClone.querySelector(selector);
      if (element) {
        content = element.innerText || element.textContent;
        if (content && content.trim().length > 100) {
          break;
        }
      }
    }
    
    // Fallback to body
    if (!content || content.trim().length < 100) {
      content = docClone.body.innerText || docClone.body.textContent;
    }
    
    // Clean content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    if (content.length > 16000) {
      content = content.substring(0, 16000) + '...';
    }
    
    console.log('✅ Content extracted successfully:', content.length, 'characters');
    return content;
    
  } catch (error) {
    console.log('❌ Content extraction error:', error);
    return null;
  }
}

// Test 3: Check storage
async function checkStorage() {
  console.log('🔍 Checking storage...');
  
  const local = await chrome.storage.local.get(null);
  const sync = await chrome.storage.sync.get(null);
  
  console.log('📦 Local storage:', local);
  console.log('🔄 Sync storage:', sync);
}

// Test 4: Clear test data
async function clearTestData() {
  console.log('🧹 Clearing test data...');
  
  await chrome.storage.local.remove([
    'currentContent', 'currentUrl', 'currentTitle', 
    'isProcessing', 'debugTest', 'lastError'
  ]);
  
  chrome.action.setBadgeText({ text: "" });
  console.log('✅ Test data cleared');
}

// Test 5: Check for CSS conflicts
async function checkPageIntegrity() {
  console.log('🔍 Checking page integrity...');
  
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      console.log('❌ No active tab found');
      return;
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: checkPageState
    });
    
    console.log('📄 Page state:', results[0].result);
    
  } catch (error) {
    console.log('❌ Page integrity check error:', error);
  }
}

// Function to check page state (injected)
function checkPageState() {
  return {
    hasStylesheets: document.styleSheets.length,
    bodyClasses: document.body.className,
    bodyStyles: window.getComputedStyle(document.body).display,
    documentTitle: document.title,
    contentLength: document.body.innerText.length
  };
}

// Main debug menu
console.log('\n🛠️ Available Debug Commands:');
console.log('  checkContextMenu() - Recreate context menu');
console.log('  simulateContextMenuClick() - Test full flow');
console.log('  checkStorage() - View storage contents');
console.log('  clearTestData() - Clear test data');
console.log('  checkPageIntegrity() - Check if page is modified');
console.log('\n💡 Recommended flow:');
console.log('  1. Run simulateContextMenuClick()');
console.log('  2. Click extension icon to open popup');
console.log('  3. Check if content appears correctly');

// Auto-run basic checks
console.log('\n🔄 Running basic checks...');
checkContextMenu();
setTimeout(() => {
  console.log('\n✅ Basic checks complete. Try simulateContextMenuClick() next.');
}, 1000);
