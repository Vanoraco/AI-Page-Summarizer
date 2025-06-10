// Extension Diagnostics Script
// Run this in the extension background console (chrome://extensions/ → service worker)

class ExtensionDiagnostics {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, status = 'info', data = null) {
    const timestamp = new Date().toISOString();
    const result = { timestamp, message, status, data };
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`, data || '');
  }

  async runDiagnostics() {
    console.log('🔍 Starting Extension Diagnostics...\n');
    
    await this.checkExtensionBasics();
    await this.checkPermissions();
    await this.checkContextMenus();
    await this.checkStorage();
    await this.checkAPIConfiguration();
    await this.checkContentScripts();
    
    this.printSummary();
  }

  async checkExtensionBasics() {
    this.log('Checking extension basics...');
    
    try {
      const manifest = chrome.runtime.getManifest();
      this.log('Extension loaded successfully', 'pass', {
        name: manifest.name,
        version: manifest.version,
        manifestVersion: manifest.manifest_version
      });
      
      if (manifest.manifest_version !== 3) {
        this.log('Using old manifest version', 'warn', `v${manifest.manifest_version}`);
      }
      
      // Check required files
      const requiredFiles = ['background.js', 'popup.html', 'popup.js', 'content.js'];
      const missingFiles = requiredFiles.filter(file => 
        !manifest.background?.service_worker?.includes(file) && 
        !manifest.action?.default_popup?.includes(file) &&
        !manifest.content_scripts?.[0]?.js?.includes(file)
      );
      
      if (missingFiles.length === 0) {
        this.log('All required files referenced in manifest', 'pass');
      } else {
        this.log('Some files may be missing', 'warn', missingFiles);
      }
      
    } catch (error) {
      this.log('Failed to load extension manifest', 'fail', error.message);
    }
  }

  async checkPermissions() {
    this.log('Checking permissions...');
    
    try {
      const manifest = chrome.runtime.getManifest();
      const permissions = manifest.permissions || [];
      const requiredPermissions = ['contextMenus', 'activeTab', 'storage', 'scripting'];
      
      const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
      
      if (missingPermissions.length === 0) {
        this.log('All required permissions granted', 'pass', permissions);
      } else {
        this.log('Missing required permissions', 'fail', missingPermissions);
      }
      
      // Check host permissions for API calls
      const hostPermissions = manifest.host_permissions || [];
      if (hostPermissions.length > 0) {
        this.log('Host permissions configured', 'pass', hostPermissions);
      } else {
        this.log('No host permissions (API calls may fail)', 'warn');
      }
      
    } catch (error) {
      this.log('Failed to check permissions', 'fail', error.message);
    }
  }

  async checkContextMenus() {
    this.log('Checking context menus...');
    
    try {
      const menus = await new Promise(resolve => {
        chrome.contextMenus.getAll(resolve);
      });
      
      const summarizerMenu = menus.find(menu => menu.id === 'summarize-page');
      
      if (summarizerMenu) {
        this.log('Summarizer context menu found', 'pass', summarizerMenu);
      } else {
        this.log('Summarizer context menu missing', 'fail', { availableMenus: menus.length });
        
        // Try to create it
        try {
          chrome.contextMenus.create({
            id: 'summarize-page-test',
            title: 'Test Summarize',
            contexts: ['page']
          });
          this.log('Successfully created test context menu', 'pass');
        } catch (createError) {
          this.log('Failed to create context menu', 'fail', createError.message);
        }
      }
      
    } catch (error) {
      this.log('Failed to check context menus', 'fail', error.message);
    }
  }

  async checkStorage() {
    this.log('Checking storage...');
    
    try {
      // Test local storage
      const testKey = 'diagnostic-test-' + Date.now();
      await chrome.storage.local.set({ [testKey]: 'test-value' });
      const result = await chrome.storage.local.get(testKey);
      
      if (result[testKey] === 'test-value') {
        this.log('Local storage working', 'pass');
        await chrome.storage.local.remove(testKey);
      } else {
        this.log('Local storage test failed', 'fail');
      }
      
      // Check existing storage
      const localData = await chrome.storage.local.get(null);
      const syncData = await chrome.storage.sync.get(null);
      
      this.log('Storage contents', 'info', {
        localItems: Object.keys(localData).length,
        syncItems: Object.keys(syncData).length,
        localKeys: Object.keys(localData),
        syncKeys: Object.keys(syncData)
      });
      
    } catch (error) {
      this.log('Storage test failed', 'fail', error.message);
    }
  }

  async checkAPIConfiguration() {
    this.log('Checking API configuration...');
    
    try {
      const settings = await chrome.storage.sync.get(['apiKey', 'provider']);
      
      if (settings.apiKey) {
        this.log('API key configured', 'pass', {
          provider: settings.provider || 'not set',
          keyLength: settings.apiKey.length,
          keyPrefix: settings.apiKey.substring(0, 10) + '...'
        });
        
        // Validate key format
        if (settings.provider === 'openai' && !settings.apiKey.startsWith('sk-')) {
          this.log('OpenAI API key format may be incorrect', 'warn');
        } else if (settings.provider === 'anthropic' && !settings.apiKey.startsWith('sk-ant-')) {
          this.log('Anthropic API key format may be incorrect', 'warn');
        }
        
      } else {
        this.log('No API key configured', 'warn', 'Extension will not be able to summarize content');
      }
      
    } catch (error) {
      this.log('Failed to check API configuration', 'fail', error.message);
    }
  }

  async checkContentScripts() {
    this.log('Checking content scripts...');
    
    try {
      const manifest = chrome.runtime.getManifest();
      const contentScripts = manifest.content_scripts || [];
      
      if (contentScripts.length > 0) {
        this.log('Content scripts configured', 'pass', {
          scripts: contentScripts.length,
          matches: contentScripts[0].matches
        });
      } else {
        this.log('No content scripts configured', 'warn');
      }
      
      // Test if we can inject scripts
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
          this.log('Active tab found for testing', 'pass', { url: tabs[0].url });
        }
      } catch (tabError) {
        this.log('Cannot access active tab', 'warn', 'May need activeTab permission');
      }
      
    } catch (error) {
      this.log('Failed to check content scripts', 'fail', error.message);
    }
  }

  printSummary() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    
    console.log('\n📊 Diagnostic Summary:');
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    
    if (failed === 0) {
      console.log('\n🎉 Extension appears to be working correctly!');
      console.log('💡 If you\'re seeing errors, they\'re likely from the website, not the extension.');
    } else {
      console.log('\n🔧 Issues found that need attention:');
      this.results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`  ❌ ${r.message}`);
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️ Warnings (may affect functionality):');
      this.results.filter(r => r.status === 'warn').forEach(r => {
        console.log(`  ⚠️ ${r.message}`);
      });
    }
    
    console.log('\n📋 Next steps:');
    if (failed === 0 && warnings === 0) {
      console.log('  1. Test context menu: Right-click on any webpage');
      console.log('  2. Test popup: Click extension icon');
      console.log('  3. Configure API key if not done already');
    } else {
      console.log('  1. Fix any failed checks above');
      console.log('  2. Reload extension in chrome://extensions/');
      console.log('  3. Run diagnostics again');
    }
  }

  exportResults() {
    const exportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        passed: this.results.filter(r => r.status === 'pass').length,
        failed: this.results.filter(r => r.status === 'fail').length,
        warnings: this.results.filter(r => r.status === 'warn').length
      }
    };
    
    console.log('📄 Diagnostic Results (copy this for support):');
    console.log(JSON.stringify(exportData, null, 2));
    return exportData;
  }
}

// Quick diagnostic function
async function quickDiagnostic() {
  const diagnostics = new ExtensionDiagnostics();
  await diagnostics.runDiagnostics();
  return diagnostics;
}

// Test specific functionality
function testContextMenu() {
  console.log('🧪 Testing context menu creation...');
  try {
    chrome.contextMenus.create({
      id: 'diagnostic-test-' + Date.now(),
      title: 'Diagnostic Test Menu',
      contexts: ['page']
    });
    console.log('✅ Context menu test successful');
  } catch (error) {
    console.log('❌ Context menu test failed:', error.message);
  }
}

function testStorage() {
  console.log('🧪 Testing storage...');
  const testData = { diagnosticTest: Date.now() };
  
  chrome.storage.local.set(testData).then(() => {
    chrome.storage.local.get('diagnosticTest').then(result => {
      if (result.diagnosticTest === testData.diagnosticTest) {
        console.log('✅ Storage test successful');
        chrome.storage.local.remove('diagnosticTest');
      } else {
        console.log('❌ Storage test failed');
      }
    });
  }).catch(error => {
    console.log('❌ Storage test error:', error.message);
  });
}

// Export functions
window.ExtensionDiagnostics = {
  run: quickDiagnostic,
  testContextMenu,
  testStorage,
  
  // Quick commands
  quick: quickDiagnostic,
  menu: testContextMenu,
  storage: testStorage
};

console.log('🔍 Extension Diagnostics Loaded!');
console.log('📋 Available commands:');
console.log('  - ExtensionDiagnostics.run() - Full diagnostic');
console.log('  - ExtensionDiagnostics.testContextMenu() - Test context menu');
console.log('  - ExtensionDiagnostics.testStorage() - Test storage');
console.log('');
console.log('💡 Run ExtensionDiagnostics.run() to start!');
