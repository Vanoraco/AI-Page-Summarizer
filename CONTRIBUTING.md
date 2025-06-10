# Contributing to AI Page Summarizer

Thank you for your interest in contributing to AI Page Summarizer! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Chrome browser (latest version recommended)
- Basic knowledge of JavaScript, HTML, and CSS
- Understanding of Chrome Extension APIs
- Git for version control

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/AI-Page-Summarizer.git
   cd AI-Page-Summarizer
   ```
3. **Load the extension** in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder
4. **Create icons** using `create-test-icons.html` for testing

## 🛠️ Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow JavaScript ES6+ standards
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

### File Structure
```
AI-Page-Summarizer/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script
├── popup.html/js/css     # Main UI
├── options.html/js/css   # Settings page
├── utils.js              # Shared utilities
├── icons/                # Extension icons
├── docs/                 # Documentation
└── tests/                # Test files
```

### Testing
- Test on multiple websites (news, blogs, documentation)
- Verify all AI providers work correctly
- Test error scenarios (no API key, network issues)
- Use the built-in debugging tools
- Run the automated test suite

## 🐛 Bug Reports

When reporting bugs, please include:
- **Chrome version** and operating system
- **Extension version** 
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Debug information** (export from debug panel)

### Bug Report Template
```markdown
**Bug Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Chrome Version: 
- OS: 
- Extension Version: 

**Additional Context:**
Any other relevant information
```

## ✨ Feature Requests

We welcome feature suggestions! Please:
- **Check existing issues** to avoid duplicates
- **Describe the feature** clearly
- **Explain the use case** and benefits
- **Consider implementation complexity**

### Feature Request Template
```markdown
**Feature Description:**
Clear description of the proposed feature

**Use Case:**
Why would this feature be useful?

**Proposed Implementation:**
How might this work technically?

**Alternatives Considered:**
Other ways to achieve the same goal
```

## 🔧 Pull Requests

### Before Submitting
- **Test thoroughly** on multiple websites
- **Update documentation** if needed
- **Add/update tests** for new functionality
- **Follow the code style** guidelines
- **Keep commits focused** and well-described

### Pull Request Process
1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** with clear, focused commits
3. **Test extensively** using the testing guides
4. **Update documentation** as needed
5. **Submit the pull request** with a clear description

### Pull Request Template
```markdown
**Description:**
Brief description of changes

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing:**
- [ ] Tested on multiple websites
- [ ] All AI providers work
- [ ] Error scenarios handled
- [ ] No console errors

**Checklist:**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🎯 Areas for Contribution

### High Priority
- **Additional AI providers** (Cohere, Hugging Face, etc.)
- **Performance optimizations**
- **Accessibility improvements**
- **Mobile responsiveness**
- **Error handling enhancements**

### Medium Priority
- **UI/UX improvements**
- **Additional language support**
- **Custom summarization options**
- **Keyboard shortcuts**
- **Dark mode theme**

### Documentation
- **API integration guides**
- **Video tutorials**
- **Translation of documentation**
- **Code examples**
- **Best practices guides**

## 🧪 Testing Guidelines

### Manual Testing
1. **Load extension** in Chrome
2. **Test context menu** on various websites
3. **Verify all AI providers** work correctly
4. **Test error scenarios**:
   - No API key configured
   - Invalid API key
   - Network connectivity issues
   - Pages with no content
5. **Check UI responsiveness**
6. **Verify settings persistence**

### Automated Testing
- Run the test suite: Load `test-extension.js` in console
- Use debugging tools: `ExtensionDiagnostics.run()`
- Check for console errors
- Verify storage functionality

## 📝 Documentation

### When to Update Documentation
- Adding new features
- Changing existing functionality
- Fixing bugs that affect user experience
- Adding new AI providers
- Updating installation steps

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI changes
- Keep installation guides up-to-date
- Update API documentation for new providers

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Helpful
- Help newcomers get started
- Share knowledge and best practices
- Provide constructive feedback
- Collaborate effectively

## 📞 Getting Help

### Resources
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing guides first
- **Code Comments**: Inline documentation in the codebase

### Response Times
- **Bug reports**: We aim to respond within 48 hours
- **Feature requests**: Response within 1 week
- **Pull requests**: Review within 1 week

## 🏆 Recognition

Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Credited in the extension description** (for major contributions)

Thank you for contributing to AI Page Summarizer! 🎉
