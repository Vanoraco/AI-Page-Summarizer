# Chat Functionality Troubleshooting Guide

## Common Issues and Solutions

### 1. "The message port closed before a response was received"

This error typically occurs when the background script takes too long to respond or when there's a communication issue between the popup and background script.

**Solutions:**
- **Check your internet connection** - Slow connections can cause timeouts
- **Verify your API key** - Invalid or expired API keys can cause failures
- **Try a shorter message** - Very long messages can exceed token limits
- **Wait and retry** - If you hit rate limits, wait a few minutes
- **Reload the extension** - Go to `chrome://extensions/` and reload the extension

### 2. "Request timed out. Please try again."

The request took longer than 30 seconds to complete.

**Solutions:**
- **Check your internet connection**
- **Try a shorter message or question**
- **Verify your API provider is working** - Check the provider's status page
- **Switch to a different AI provider** in settings

### 3. "Extension background script is not responding"

The background script is not running or has crashed.

**Solutions:**
- **Reload the extension** in `chrome://extensions/`
- **Check for extension errors** in the Chrome extensions page
- **Restart Chrome** if the issue persists

### 4. "API key not configured"

No API key is set in the extension settings.

**Solutions:**
- Click the settings (gear) icon in the extension popup
- Select your AI provider
- Enter your valid API key
- Click "Save Settings"

### 5. Chat responses are cut off or incomplete

The AI response was truncated due to token limits.

**Solutions:**
- Ask more specific questions
- Break complex questions into smaller parts
- Try asking follow-up questions for more details

## Best Practices for Chat

### 1. Effective Questions
- Be specific about what you want to know
- Reference specific parts of the page content
- Ask one question at a time for better responses

### 2. Managing Context
- The AI has access to the current page content
- Chat history is maintained during your session
- Use the clear button to start fresh conversations

### 3. Token Management
- Keep messages reasonably short
- The extension automatically limits content to avoid token limits
- Chat history is limited to the last 6 messages for context

## Debugging Steps

### 1. Check Extension Status
1. Go to `chrome://extensions/`
2. Find "AI Page Summarizer"
3. Make sure it's enabled
4. Check for any error messages

### 2. Test API Connection
1. Open extension settings
2. Click "Test Connection"
3. Verify your API key works

### 3. Check Browser Console
1. Right-click on the extension popup
2. Select "Inspect"
3. Go to the Console tab
4. Look for error messages

### 4. Verify Page Content
1. Make sure you're on a page with text content
2. Try the summarize function first
3. Then switch to chat

## API Provider Specific Issues

### OpenAI
- **Rate Limits**: Free tier has strict limits
- **API Key Format**: Should start with `sk-`
- **Common Error**: "Insufficient quota" means you need to add credits

### Anthropic Claude
- **API Key Format**: Should start with `sk-ant-`
- **Rate Limits**: Check your usage dashboard
- **Model Access**: Make sure you have access to Claude models

### Google Gemini
- **Free Tier**: Has generous limits but can still be exceeded
- **API Key Format**: Usually 39 characters long
- **Region Restrictions**: Some regions may have limited access

## Getting Help

If you continue to experience issues:

1. **Check the browser console** for detailed error messages
2. **Try different AI providers** to isolate the issue
3. **Test on different websites** to see if it's content-specific
4. **Reload the extension** and try again
5. **Check your API provider's status page** for service issues

## Performance Tips

1. **Use shorter messages** for faster responses
2. **Clear chat history** periodically to improve performance
3. **Switch providers** if one is experiencing issues
4. **Ensure stable internet connection** for best results

## Error Codes Reference

- **400**: Bad request - Check your message format
- **401**: Unauthorized - Invalid API key
- **403**: Forbidden - API key lacks permissions
- **429**: Rate limit exceeded - Wait and retry
- **500**: Server error - Provider issue, try again later
