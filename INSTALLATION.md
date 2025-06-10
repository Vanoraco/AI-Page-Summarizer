# Installation Guide - AI Page Summarizer

This guide will help you install and set up the AI Page Summarizer Chrome extension.

## Step 1: Prepare the Extension

### Download the Extension
- Download or clone this repository to your computer
- Extract the files if you downloaded a ZIP archive
- Make sure all files are in a single folder

### Add Extension Icons (Required)
The extension needs icon files to work properly:

1. **Create or download icons** in PNG format:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels) 
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. **Place icons** in the `icons/` folder
3. **Icon suggestions**:
   - Use a document with AI/brain symbol
   - Use blue-purple colors (#667eea to #764ba2)
   - Keep design simple and recognizable at small sizes

## Step 2: Install in Chrome

### Load the Extension
1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Enable Developer Mode** by toggling the switch in the top-right corner
3. **Click "Load unpacked"** button
4. **Select the extension folder** containing the manifest.json file
5. **Confirm installation** - the extension should appear in your extensions list

### Verify Installation
- Look for the extension icon in your Chrome toolbar
- Right-click on any webpage to see "Summarize this page" in the context menu
- Click the extension icon to open the popup

## Step 3: Get an API Key

You need an API key from an AI provider to use the extension.

### Option 1: OpenAI (Recommended for beginners)
1. **Visit** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Sign up** or log in to your account
3. **Click "Create new secret key"**
4. **Copy the key** (starts with `sk-`)
5. **Add billing information** if required

**Pricing**: ~$0.01-$0.05 per summary (very affordable)

### Option 2: Anthropic Claude
1. **Visit** [console.anthropic.com](https://console.anthropic.com/)
2. **Sign up** or log in to your account
3. **Go to API Keys** section
4. **Create a new key** and copy it (starts with `sk-ant-`)
5. **Add billing information** if required

**Pricing**: ~$0.005-$0.02 per summary

## Step 4: Configure the Extension

### Add Your API Key
1. **Click the extension icon** in your Chrome toolbar
2. **Click the settings (gear) icon** in the popup
3. **Select your AI provider** (OpenAI or Anthropic)
4. **Enter your API key** in the text field
5. **Click "Save Settings"**

### Test the Connection
1. **Click "Test Connection"** button
2. **Wait for the test** to complete
3. **Look for success message** - "✅ Connection successful!"
4. **If it fails**, check your API key and try again

## Step 5: Start Summarizing!

### Basic Usage
1. **Navigate to any webpage** with text content (news article, blog post, etc.)
2. **Right-click anywhere** on the page
3. **Select "Summarize this page"** from the context menu
4. **Wait for processing** (usually 5-10 seconds)
5. **Read your summary** in the popup

### Tips for Best Results
- **Works best on**: Articles, blog posts, news stories, documentation
- **May not work well on**: Social media feeds, image-heavy pages, login pages
- **Content length**: Works with both short and long articles
- **Languages**: Primarily optimized for English content

## Troubleshooting

### Extension Not Loading
- **Check file structure**: Make sure `manifest.json` is in the root folder
- **Add icons**: The extension requires icon files to load properly
- **Check Chrome version**: Requires Chrome 88+ for Manifest V3 support

### Context Menu Not Appearing
- **Refresh the page** after installing the extension
- **Check extension is enabled** in `chrome://extensions/`
- **Try a different website** - some sites may block extensions

### API Errors
- **"API key not configured"**: Add your API key in settings
- **"Invalid API key"**: Check your key is correct and has billing enabled
- **"Rate limit exceeded"**: Wait a few minutes and try again
- **"Connection failed"**: Check your internet connection

### Content Extraction Issues
- **"Unable to extract content"**: The page may not have enough text
- **Poor quality summaries**: Try on pages with more structured content
- **Missing content**: Some websites may block content extraction

## Security Notes

### Your Data is Safe
- **API keys stored locally** in your browser only
- **No data sent to our servers** - direct communication with AI providers
- **Content not stored** - processed in real-time only
- **HTTPS encryption** for all API communications

### Best Practices
- **Keep API keys private** - don't share them
- **Monitor usage** through your AI provider's dashboard
- **Set spending limits** in your AI provider account
- **Disable extension** on sensitive websites if concerned

## Getting Help

### Common Solutions
1. **Restart Chrome** after installation
2. **Refresh webpages** before trying to summarize
3. **Check API key** has sufficient credits/quota
4. **Try different websites** to test functionality

### Support Resources
- **Check browser console** (F12) for error messages
- **Test API connection** in extension settings
- **Verify API key** on provider's website
- **Check extension permissions** in Chrome settings

### Contact Information
If you continue having issues:
- Check the GitHub repository for known issues
- Review the troubleshooting section in README.md
- Ensure you're using a supported Chrome version

## Success! 🎉

Once everything is set up, you should be able to:
- ✅ Right-click and see "Summarize this page"
- ✅ Get AI summaries in 5-10 seconds
- ✅ Copy summaries to clipboard
- ✅ Use on most text-based websites

Enjoy your new AI-powered reading assistant!
