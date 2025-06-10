# Changelog

All notable changes to the AI Page Summarizer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-12-19

### Added
- **Draggable Floating Bubble**: Beautiful floating bubble appears on every page for instant access
- **Bubble Customization**: Configure bubble visibility and default position in settings
- **Position Memory**: Bubble remembers where you dragged it across page reloads
- **Multiple Access Methods**: Use floating bubble, context menu, or extension icon
- **Interface Settings**: New settings section for bubble configuration
- **Touch Support**: Full touch device support for bubble dragging
- **Responsive Bubble**: Adapts to different screen sizes and mobile devices

### Improved
- **Content Extraction**: Better automatic content extraction for chat functionality
- **Error Handling**: Enhanced error messages and timeout handling
- **User Experience**: More intuitive access to summarization features
- **Performance**: Optimized bubble animations and interactions
- **Accessibility**: Better keyboard and screen reader support

### Changed
- **Extension Version**: Updated to 1.2.0 with new floating bubble feature
- **Manifest Description**: Updated to reflect new floating bubble functionality
- **Options Page**: Added interface settings section
- **Content Script**: Extended with floating bubble implementation

### Technical
- Added floating bubble creation and management in content.js
- Implemented drag and drop functionality with position persistence
- Enhanced options.js with bubble settings management
- Added bubble visibility controls across all tabs
- Improved CSS with glassmorphism and neuromorphic design elements

## [1.1.0] - 2024-12-19

### Added
- **Interactive Chat Functionality**: Chat with AI about the current page content
- **Tab-Based Interface**: Switch between Summary and Chat tabs in the popup
- **Context-Aware AI**: AI understands the page content and provides relevant responses
- **Chat History Management**: Conversation history maintained during sessions
- **Google Gemini Support**: Added Google Gemini as a third AI provider option
- **Enhanced UI Design**: Improved neuromorphic design with better animations
- **Auto-Resizing Chat Input**: Chat input automatically adjusts height
- **Chat Loading Indicators**: Beautiful typing indicators while AI responds
- **Clear Chat Functionality**: Button to clear chat history and start fresh

### Changed
- **Popup Interface**: Redesigned with tab navigation for better organization
- **Header Layout**: Updated header to accommodate tab switcher and controls
- **CSS Architecture**: Enhanced styles for chat interface and improved responsiveness
- **Message Handling**: Extended background script to handle chat requests

### Technical
- Added chat message processing in background.js
- Extended popup.js with chat functionality and tab management
- Enhanced CSS with chat-specific styles and animations
- Improved error handling for chat interactions

## [1.0.0] - 2024-12-10

### Added
- Initial release of AI Page Summarizer Chrome Extension
- Context menu integration with "Summarize this page" option
- Support for multiple AI providers:
  - OpenAI GPT-3.5 Turbo
  - Anthropic Claude (Haiku)
  - Google Gemini 1.5 Flash
- Smart content extraction from webpages
- Clean, responsive popup interface with multiple states:
  - Loading state with spinner
  - Success state with summary display
  - Error state with helpful messages
  - Initial welcome state
- Comprehensive settings page with:
  - AI provider selection
  - API key configuration
  - Connection testing
  - Setup instructions for each provider
- Built-in debugging tools:
  - Debug panel in popup
  - Comprehensive logging
  - Storage inspection
  - Error tracking
- Privacy-first design:
  - API keys stored locally only
  - Direct communication with AI providers
  - No data retention
- Copy-to-clipboard functionality
- Manifest V3 compliance
- Comprehensive error handling
- Support for various website types (news, blogs, documentation, etc.)

### Technical Features
- Non-destructive content extraction (doesn't modify original page)
- Intelligent content filtering (removes ads, navigation, etc.)
- Token management and content chunking
- Responsive design for different screen sizes
- Comprehensive test suite and debugging tools

### Documentation
- Complete installation guide
- Testing and debugging documentation
- API setup instructions for all providers
- Troubleshooting guide
- Developer documentation

## [Unreleased]

### Planned Features
- Support for additional AI providers
- Custom summarization prompts
- Summary length options
- Keyboard shortcuts
- Dark mode theme
- Summary history
- Export functionality (PDF, text)
- Multi-language support
