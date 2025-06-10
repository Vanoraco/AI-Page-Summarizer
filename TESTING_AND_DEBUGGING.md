# Testing and Debugging Guide

This guide will help you test the AI Page Summarizer extension and debug any issues that arise.

## Quick Testing Setup

### 1. Create Temporary Icons (For Testing)
Since you need icons to load the extension, let's create simple placeholder icons:

```bash
# Create simple colored squares as temporary icons (Windows PowerShell)
# You can also download any 16x16, 32x32, 48x48, 128x128 PNG files and rename them

# Or use online tools like:
# - https://favicon.io/favicon-generator/
# - https://www.canva.com/create/favicons/
# - https://realfavicongenerator.net/
```

### 2. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select your extension folder
5. Note any immediate errors in the Extensions page

### 3. Basic Functionality Test
1. **Context Menu Test**: Right-click on any webpage → Look for "Summarize this page"
2. **Popup Test**: Click the extension icon in toolbar
3. **Settings Test**: Click settings gear icon in popup

## Debugging Tools and Techniques

### 1. Chrome DevTools for Extension

#### Background Script Debugging
```javascript
// Open Chrome DevTools for the background script:
// 1. Go to chrome://extensions/
// 2. Find your extension
// 3. Click "service worker" link
// 4. This opens DevTools for background.js
```

#### Popup Debugging
```javascript
// Debug the popup:
// 1. Click extension icon to open popup
// 2. Right-click inside popup → "Inspect"
// 3. This opens DevTools for popup.html/js
```

#### Content Script Debugging
```javascript
// Debug content scripts:
// 1. Open any webpage
// 2. Press F12 to open DevTools
// 3. Go to Console tab
// 4. Content script errors will appear here
```

### 2. Built-in Debug Features

The extension now includes comprehensive debugging tools:

#### Debug Panel in Popup
1. **Open extension popup**
2. **Click "Debug" link** in footer
3. **View debug information**:
   - Extension status and version
   - Storage data (local and sync)
   - Real-time debugging info
4. **Use debug actions**:
   - Refresh debug info
   - Clear all storage
   - Export debug data as JSON

#### Console Logging
The extension logs detailed information to browser console:
- Background script logs: `[AI Summarizer Background]`
- Popup script logs: `[AI Summarizer Popup]`
- Content script logs: `[AI Summarizer Content]`

## Automated Testing

### Using the Test Script
1. **Load the test script** in any webpage console:
```javascript
// Copy and paste the contents of test-extension.js into browser console
```

2. **Run automated tests**:
```javascript
// Run all tests
ExtensionTester.runAllTests();

// Quick test
ExtensionTester.quickTest();

// Test specific functionality
ExtensionTester.testContentExtraction();
ExtensionTester.testApiCall();
```

### Manual Testing Checklist

#### ✅ Installation Tests
- [ ] Extension loads without errors in chrome://extensions/
- [ ] All required permissions are granted
- [ ] Extension icon appears in toolbar
- [ ] Context menu item appears on right-click

#### ✅ Content Extraction Tests
Test on different types of websites:
- [ ] News articles (CNN, BBC, Reuters)
- [ ] Blog posts (Medium, personal blogs)
- [ ] Documentation sites (MDN, GitHub)
- [ ] Wikipedia articles
- [ ] E-commerce product pages

#### ✅ API Integration Tests
- [ ] OpenAI API connection works
- [ ] Anthropic API connection works
- [ ] Error handling for invalid API keys
- [ ] Rate limiting handling
- [ ] Network error handling

#### ✅ UI/UX Tests
- [ ] Popup opens correctly
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Success state shows summary
- [ ] Copy functionality works
- [ ] Settings page accessible

## Common Issues and Solutions

### 1. Extension Won't Load
**Symptoms**: Error in chrome://extensions/
**Solutions**:
```javascript
// Check manifest.json syntax
JSON.parse(manifestContent); // Should not throw error

// Verify all files exist
// Check file paths in manifest.json
```

### 2. Context Menu Missing
**Symptoms**: No "Summarize" option on right-click
**Debug Steps**:
1. Check background script console for errors
2. Verify contextMenus permission
3. Try refreshing the page
4. Check if extension is enabled

### 3. Content Extraction Fails
**Symptoms**: "Unable to extract content" error
**Debug Steps**:
```javascript
// Test content extraction manually
ExtensionTester.testContentExtraction();

// Check what content is available
console.log('Page text length:', document.body.innerText.length);
console.log('Main elements:', document.querySelectorAll('article, main, .content').length);
```

### 4. API Errors
**Symptoms**: Summarization fails with API errors
**Debug Steps**:
```javascript
// Test API connection
ExtensionTester.testApiCall();

// Check API key format
const settings = await chrome.storage.sync.get(['apiKey']);
console.log('API key length:', settings.apiKey?.length);
console.log('API key starts with:', settings.apiKey?.substring(0, 10));
```

### 5. Storage Issues
**Symptoms**: Settings not saving, data not persisting
**Debug Steps**:
```javascript
// Check storage contents
chrome.storage.local.get(null).then(console.log);
chrome.storage.sync.get(null).then(console.log);

// Test storage write/read
chrome.storage.local.set({test: 'value'});
chrome.storage.local.get('test').then(console.log);
```

## Performance Testing

### Content Processing Speed
```javascript
// Measure content extraction time
console.time('content-extraction');
const content = ExtensionTester.testContentExtraction();
console.timeEnd('content-extraction');
```

### API Response Time
```javascript
// Measure API call time
console.time('api-call');
await ExtensionTester.testApiCall();
console.timeEnd('api-call');
```

### Memory Usage
1. Open Chrome Task Manager (Shift+Esc)
2. Look for extension processes
3. Monitor memory usage during operation

## Error Logging and Reporting

### Export Debug Information
1. Open extension popup
2. Click "Debug" link
3. Click "Export Debug Info"
4. Save the JSON file for analysis

### Console Error Patterns
Look for these common error patterns:

```javascript
// Permission errors
"Cannot access chrome-extension://"
"Extension context invalidated"

// API errors
"Failed to fetch"
"401 Unauthorized"
"429 Too Many Requests"

// Content script errors
"Cannot read property of null"
"Script injection failed"
```

## Testing on Different Websites

### Recommended Test Sites
1. **News**: https://www.bbc.com/news (any article)
2. **Blog**: https://medium.com (any article)
3. **Documentation**: https://developer.mozilla.org
4. **Wikipedia**: https://en.wikipedia.org (any article)
5. **GitHub**: https://github.com (README files)

### Sites That May Not Work
- Social media feeds (Twitter, Facebook)
- Single-page applications with dynamic content
- Sites with heavy JavaScript rendering
- Login-required content
- Sites that block content scripts

## Debugging Workflow

### Step-by-Step Debugging Process
1. **Reproduce the issue** consistently
2. **Check extension console** for errors
3. **Use debug panel** to inspect state
4. **Test individual components** with test script
5. **Export debug info** if needed
6. **Check network tab** for API calls
7. **Verify permissions** and settings

### Advanced Debugging
```javascript
// Enable verbose logging
localStorage.setItem('ai-summarizer-debug', 'true');

// Monitor all extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender);
});

// Track storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, 'in:', namespace);
});
```

## Getting Help

If you encounter issues:
1. **Export debug information** from the debug panel
2. **Check browser console** for error messages
3. **Test on multiple websites** to isolate the issue
4. **Verify API key and settings** are correct
5. **Try disabling other extensions** to check for conflicts

The extension includes comprehensive error handling and logging to help identify and resolve issues quickly.
