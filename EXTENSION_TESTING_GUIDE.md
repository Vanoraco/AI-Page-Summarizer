# Extension Testing Guide - Isolating Extension Issues

This guide helps you test the AI Page Summarizer extension while filtering out unrelated website errors.

## 🎯 Quick Extension Test (2 minutes)

### Step 1: Load Extension with Icons
1. **Create test icons**: Open `create-test-icons.html` → Generate → Download all
2. **Place icons** in `icons/` folder
3. **Load extension**: Chrome → `chrome://extensions/` → Developer mode → Load unpacked
4. **Check for extension errors**: Look for red error text under the extension

### Step 2: Test Extension Console (Most Important)
1. **Open extension background console**:
   - Go to `chrome://extensions/`
   - Find "AI Page Summarizer"
   - Click "service worker" link
   - This opens the **extension's console** (separate from website)

2. **Look for extension-specific logs**:
   ```
   ✅ Good logs (extension working):
   [AI Summarizer Background] Extension installed, creating context menu
   [AI Summarizer Background] Context menu created successfully
   
   ❌ Bad logs (extension issues):
   Error: Cannot read property...
   Uncaught TypeError in background.js...
   ```

### Step 3: Test Basic Functionality
1. **Right-click on any webpage**
2. **Look for "Summarize this page"** in context menu
3. **Click it** and watch the extension console for logs
4. **Click extension icon** to open popup

## 🔧 Extension-Specific Debugging

### Method 1: Use Extension Console Only
```javascript
// In the extension background console (chrome://extensions/ → service worker):

// Check if extension loaded properly
console.log('Extension manifest:', chrome.runtime.getManifest());

// Test context menu creation
chrome.contextMenus.create({
  id: "test-menu",
  title: "Test Menu",
  contexts: ["page"]
});

// Check storage
chrome.storage.local.get(null).then(console.log);
```

### Method 2: Filter Website Noise
When testing on websites, **ignore these common website errors**:
- React errors (Minified React error #418, #423)
- Failed to fetch / net::ERR_BLOCKED_BY_CLIENT
- jQuery is not defined
- FedCM/Google Sign-in errors
- Any errors from files like `main.*.js`, `nj-engine.js`, etc.

**Focus only on errors mentioning**:
- `background.js`
- `popup.js`
- `content.js`
- `[AI Summarizer]` logs

### Method 3: Test on Clean Pages
Test on simple pages without complex JavaScript:

1. **Wikipedia**: https://en.wikipedia.org/wiki/Artificial_intelligence
2. **MDN Docs**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
3. **GitHub README**: https://github.com/microsoft/vscode
4. **Simple blog**: Any basic WordPress blog

## 🚀 Step-by-Step Extension Test

### 1. Extension Loading Test
```javascript
// In extension background console:
console.log('Testing extension loading...');
console.log('Manifest:', chrome.runtime.getManifest());
console.log('Extension ID:', chrome.runtime.id);
```

**Expected output**:
```
Testing extension loading...
Manifest: {name: "AI Page Summarizer", version: "1.0.0", ...}
Extension ID: [some-extension-id]
```

### 2. Context Menu Test
```javascript
// In extension background console:
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "test-summarize",
    title: "Test Summarize",
    contexts: ["page"]
  });
  console.log('Test context menu created');
});
```

Then right-click on any page and look for "Test Summarize".

### 3. Content Extraction Test
```javascript
// In any webpage console (F12):
// This tests if content extraction works
const testContent = document.body.innerText;
console.log('Page content length:', testContent.length);
console.log('First 100 chars:', testContent.substring(0, 100));
```

### 4. Storage Test
```javascript
// In extension background console:
chrome.storage.local.set({test: 'hello'}).then(() => {
  chrome.storage.local.get('test').then(result => {
    console.log('Storage test result:', result);
  });
});
```

### 5. API Key Test (if configured)
```javascript
// In extension background console:
chrome.storage.sync.get(['apiKey', 'provider']).then(settings => {
  console.log('API settings:', {
    hasKey: !!settings.apiKey,
    keyLength: settings.apiKey?.length || 0,
    provider: settings.provider
  });
});
```

## 🐛 Common Extension Issues and Fixes

### Issue 1: Extension Won't Load
**Symptoms**: Red error in chrome://extensions/
**Check**:
- All files exist (manifest.json, background.js, etc.)
- Icons exist in icons/ folder
- manifest.json syntax is valid

**Fix**:
```bash
# Check if all files exist
ls -la manifest.json background.js popup.html icons/
```

### Issue 2: Context Menu Missing
**Symptoms**: No "Summarize" option on right-click
**Debug**:
```javascript
// In extension background console:
chrome.contextMenus.getAll(menus => {
  console.log('Current context menus:', menus);
});
```

### Issue 3: Popup Won't Open
**Symptoms**: Clicking extension icon does nothing
**Debug**:
1. Check popup.html exists
2. Open popup console: Right-click extension icon → Inspect popup
3. Look for errors in popup console

### Issue 4: Content Extraction Fails
**Symptoms**: "No content extracted" error
**Debug**:
```javascript
// Test on the problematic page:
ExtensionTester.testContentExtraction();
```

## 📊 Extension Health Check

Run this complete health check in the extension background console:

```javascript
// Extension Health Check
async function extensionHealthCheck() {
  console.log('🏥 Extension Health Check Starting...');
  
  // 1. Basic extension info
  const manifest = chrome.runtime.getManifest();
  console.log('✅ Extension loaded:', manifest.name, 'v' + manifest.version);
  
  // 2. Check permissions
  const permissions = manifest.permissions;
  console.log('✅ Permissions:', permissions);
  
  // 3. Check context menus
  chrome.contextMenus.getAll(menus => {
    console.log('✅ Context menus:', menus.length, 'items');
  });
  
  // 4. Check storage
  const local = await chrome.storage.local.get(null);
  const sync = await chrome.storage.sync.get(null);
  console.log('✅ Storage - Local items:', Object.keys(local).length);
  console.log('✅ Storage - Sync items:', Object.keys(sync).length);
  
  // 5. Check API settings
  const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
  console.log('✅ API configured:', !!settings.apiKey, 'Provider:', settings.provider);
  
  console.log('🎉 Health check complete!');
}

extensionHealthCheck();
```

## 🎯 Success Indicators

**Extension is working correctly when you see**:
- ✅ Context menu appears on right-click
- ✅ Extension icon opens popup
- ✅ No errors in extension background console
- ✅ `[AI Summarizer Background]` logs appear
- ✅ Settings page opens and saves data

**Website errors to ignore**:
- ❌ React errors from website
- ❌ Failed fetch requests to website APIs
- ❌ jQuery/library errors from website
- ❌ Ad blocker blocking website resources

## 🚨 When to Worry

**Only worry about errors that**:
- Mention our extension files (background.js, popup.js, content.js)
- Appear in the extension background console
- Prevent basic functionality (context menu, popup, settings)
- Show `[AI Summarizer]` in the log message

Remember: A website having errors doesn't mean our extension has errors!
