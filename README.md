# AI Page Summarizer - Chrome Extension

A powerful Chrome extension that uses AI to summarize any webpage content with a simple right-click. Get concise, intelligent summaries of articles, blog posts, news, and more in seconds.

## Features

- **🤖 AI-Powered Summarization**: Uses OpenAI GPT, Anthropic Claude, or Google Gemini for intelligent content analysis
- **⚡ One-Click Access**: Right-click context menu integration for instant summarization
- **🎯 Smart Content Extraction**: Automatically identifies and extracts main content from web pages
- **🔒 Privacy-First**: Your API key stays local, direct communication with AI providers
- **📱 Clean Interface**: Beautiful, responsive popup with loading states and error handling
- **⚙️ Flexible Configuration**: Support for multiple AI providers with easy setup
- **📋 Copy & Share**: One-click copying of summaries for easy sharing

## Installation

### From Source (Development)

1. **Clone or Download** this repository to your local machine
2. **Add Icons**: Create icon files in the `icons/` directory (see `icons/README.md` for specifications)
3. **Open Chrome Extensions**: Navigate to `chrome://extensions/`
4. **Enable Developer Mode**: Toggle the "Developer mode" switch in the top right
5. **Load Extension**: Click "Load unpacked" and select the extension directory
6. **Configure API**: Click the extension icon and go to settings to add your API key

### Prerequisites

You'll need an API key from one of these providers:

- **OpenAI**: Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: Get one at [console.anthropic.com](https://console.anthropic.com/)
- **Google Gemini**: Get one at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## Usage

### Quick Start

1. **Configure API Key**: 
   - Click the extension icon in your toolbar
   - Click the settings (gear) icon
   - Select your AI provider and enter your API key
   - Click "Save Settings"

2. **Summarize Any Page**:
   - Navigate to any webpage with text content
   - Right-click anywhere on the page
   - Select "Summarize this page" from the context menu
   - Wait for the AI to process the content
   - View your summary in the popup

### Advanced Features

- **Test Connection**: Use the "Test Connection" button in settings to verify your API key
- **Copy Summaries**: Click the copy button to copy summaries to your clipboard
- **Multiple Providers**: Switch between OpenAI and Anthropic based on your preference
- **Error Handling**: Clear error messages help troubleshoot any issues

## File Structure

```
ai-page-summarizer/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menu and API calls
├── content.js            # Content script for text extraction
├── popup.html            # Main popup interface
├── popup.js              # Popup logic and UI handling
├── popup.css             # Popup styling
├── options.html          # Settings page
├── options.js            # Settings page logic
├── options.css           # Settings page styling
├── utils.js              # Shared utility functions
├── icons/                # Extension icons (16, 32, 48, 128px)
│   └── README.md         # Icon creation guidelines
└── README.md             # This file
```

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension architecture
- **Service Worker**: Background script handles context menu and API communication
- **Content Scripts**: Extract meaningful content from web pages
- **Storage API**: Securely stores settings locally and synced across devices

### Content Extraction

The extension uses intelligent content extraction:
- Prioritizes semantic HTML elements (`<article>`, `<main>`, etc.)
- Filters out navigation, ads, and other non-content elements
- Validates content quality before processing
- Handles various website layouts and structures

### AI Integration

- **OpenAI GPT-3.5 Turbo**: Fast, cost-effective summarization
- **Anthropic Claude**: High-quality, nuanced understanding
- **Token Management**: Automatically handles content length limits
- **Error Handling**: Graceful handling of API errors and rate limits

### Privacy & Security

- **Local Storage**: API keys stored locally in your browser
- **Direct API Calls**: No intermediary servers, direct communication with AI providers
- **No Data Retention**: Content is processed in real-time and not stored
- **Secure Transmission**: All API calls use HTTPS encryption

## Development

### Setup Development Environment

1. Clone the repository
2. Make your changes
3. Test in Chrome by loading as unpacked extension
4. Use Chrome DevTools for debugging

### Key Components

- **Background Script** (`background.js`): Handles context menu, content extraction, and API calls
- **Content Script** (`content.js`): Extracts text content from web pages
- **Popup** (`popup.js`): Manages the user interface and displays summaries
- **Options** (`options.js`): Handles settings and API key management

### Testing

- Test on various websites (news, blogs, documentation, etc.)
- Verify content extraction quality
- Test error scenarios (no API key, network issues, etc.)
- Check responsive design on different screen sizes

## API Costs

### OpenAI (GPT-3.5 Turbo)
- Input: ~$0.0015 per 1K tokens
- Output: ~$0.002 per 1K tokens
- **Typical cost per summary**: $0.01 - $0.05

### Anthropic (Claude)
- Input: ~$0.25 per 1M tokens
- Output: ~$1.25 per 1M tokens
- **Typical cost per summary**: $0.005 - $0.02

### Google Gemini
- Input: ~$0.075 per 1M tokens
- Output: ~$0.30 per 1M tokens
- **Typical cost per summary**: $0.003 - $0.015
- **Free tier available** with generous limits

*Costs are estimates and may vary. Check provider websites for current pricing.*

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Go to extension settings and add your API key
   - Make sure you selected the correct provider

2. **"Unable to extract meaningful content"**
   - The page might not have enough text content
   - Try on a different page with more text

3. **"Rate limit exceeded"**
   - You've hit your API rate limit
   - Wait a few minutes and try again

4. **Extension not appearing in context menu**
   - Make sure the extension is enabled
   - Try refreshing the page

### Getting Help

- Check the browser console for error messages
- Verify your API key is valid and has sufficient credits
- Test the connection in extension settings

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source. Please check the license file for details.

## Changelog

### Version 1.0.0
- Initial release
- OpenAI and Anthropic support
- Context menu integration
- Smart content extraction
- Settings page with API key management
- Copy functionality
- Error handling and loading states
