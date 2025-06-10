# Changelog

All notable changes to the AI Page Summarizer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
