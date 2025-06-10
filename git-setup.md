# Git Setup Commands for AI Page Summarizer

Follow these commands to set up your Git repository and push to GitHub.

## 🚀 Initial Git Setup

### 1. Initialize Git Repository
```bash
# Initialize git in your project directory
git init

# Add the remote repository
git remote add origin https://github.com/Vanoraco/AI-Page-Summarizer.git
```

### 2. Configure Git (if not already done)
```bash
# Set your name and email (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Or set locally for this project only
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Add All Files
```bash
# Add all files to staging
git add .

# Or add files individually if you prefer
git add manifest.json
git add background.js
git add popup.html popup.js popup.css
git add options.html options.js options.css
git add content.js utils.js
git add README.md LICENSE CHANGELOG.md CONTRIBUTING.md SECURITY.md
git add .gitignore package.json
git add icons/README.md
git add *.md *.html *.js
```

### 4. Create Initial Commit
```bash
# Create the initial commit
git commit -m "Initial release: AI Page Summarizer v1.0.0

Features:
- Chrome Extension Manifest V3
- Support for OpenAI GPT, Anthropic Claude, and Google Gemini
- Context menu integration
- Smart content extraction
- Responsive popup interface
- Comprehensive settings page
- Built-in debugging tools
- Privacy-first design
- Complete documentation"
```

### 5. Push to GitHub
```bash
# Push to the main branch
git push -u origin main

# If the above fails, try:
git branch -M main
git push -u origin main
```

## 🔄 Alternative: If Repository Already Exists

If the GitHub repository already has content:

```bash
# Pull existing content first
git pull origin main --allow-unrelated-histories

# Then push your changes
git push origin main
```

## 📁 Verify Your Files

Before pushing, make sure you have these files:

### Core Extension Files
- [x] `manifest.json`
- [x] `background.js`
- [x] `content.js`
- [x] `popup.html`, `popup.js`, `popup.css`
- [x] `options.html`, `options.js`, `options.css`
- [x] `utils.js`

### Documentation
- [x] `README.md`
- [x] `INSTALLATION.md`
- [x] `TESTING_AND_DEBUGGING.md`
- [x] `TESTING_CHECKLIST.md`
- [x] `EXTENSION_TESTING_GUIDE.md`
- [x] `CHANGELOG.md`
- [x] `CONTRIBUTING.md`
- [x] `SECURITY.md`
- [x] `LICENSE`

### Configuration
- [x] `.gitignore`
- [x] `package.json`

### Icons Directory
- [x] `icons/README.md`
- [ ] `icons/icon16.png` (create using create-test-icons.html)
- [ ] `icons/icon32.png`
- [ ] `icons/icon48.png`
- [ ] `icons/icon128.png`

### Testing & Debug Files
- [x] `test-extension.js`
- [x] `extension-diagnostics.js`
- [x] `debug-context-menu.js`
- [x] `create-test-icons.html`

## 🎯 Quick Commands Summary

```bash
# Complete setup in one go:
git init
git remote add origin https://github.com/Vanoraco/AI-Page-Summarizer.git
git add .
git commit -m "Initial release: AI Page Summarizer v1.0.0"
git branch -M main
git push -u origin main
```

## 🔍 Verify Upload

After pushing, check your GitHub repository:
1. Go to https://github.com/Vanoraco/AI-Page-Summarizer
2. Verify all files are uploaded
3. Check that README.md displays correctly
4. Ensure all documentation files are present

## 📝 Next Steps After Upload

1. **Create Release**: Tag version 1.0.0 on GitHub
2. **Add Topics**: Add relevant topics to your repository
3. **Enable Issues**: Turn on GitHub Issues for bug reports
4. **Set up Discussions**: Enable GitHub Discussions for community
5. **Add Repository Description**: Add a short description and website URL
6. **Create GitHub Pages**: Consider enabling GitHub Pages for documentation

## 🏷️ Creating a Release

```bash
# Create and push a tag for v1.0.0
git tag -a v1.0.0 -m "AI Page Summarizer v1.0.0 - Initial Release"
git push origin v1.0.0
```

Then go to GitHub → Releases → Create a new release using the v1.0.0 tag.

## 🚨 Troubleshooting

### If push is rejected:
```bash
# Force push (use carefully)
git push --force origin main

# Or pull and merge first
git pull origin main --allow-unrelated-histories
git push origin main
```

### If you need to remove large files:
```bash
# Remove from git but keep locally
git rm --cached filename

# Remove completely
git rm filename
```

### If you need to change commit message:
```bash
# Change last commit message
git commit --amend -m "New commit message"
```

Your AI Page Summarizer extension is now ready for GitHub! 🎉
