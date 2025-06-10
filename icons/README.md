# Extension Icons

This directory should contain the extension icons in PNG format with the following specifications:

## Required Icon Files

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows taskbar)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Icon Design Guidelines

### Visual Design
- Use a clean, modern design that represents AI/summarization
- Consider using elements like:
  - Document/page icon with AI elements
  - Brain or neural network symbols
  - Text summarization symbols (lines getting shorter)
  - Layered documents with a summary indicator

### Color Scheme
- Primary: #667eea (blue-purple gradient start)
- Secondary: #764ba2 (blue-purple gradient end)
- Accent: White or light colors for contrast
- Background: Transparent or solid color

### Technical Requirements
- Format: PNG with transparency
- Color depth: 32-bit (RGBA)
- Sharp edges at all sizes
- Readable at 16x16 pixels

## Creating Icons

### Option 1: Design Tools
- Use tools like Figma, Sketch, or Adobe Illustrator
- Create vector graphics first, then export to PNG
- Ensure crisp rendering at all required sizes

### Option 2: Icon Generators
- Use online icon generators or AI tools
- Search for "chrome extension icon generator"
- Customize with your brand colors

### Option 3: Icon Libraries
- Use icon libraries like Heroicons, Feather Icons, or Material Icons
- Combine multiple icons to create a unique design
- Ensure proper licensing for commercial use

## Example Icon Concepts

1. **Document with AI Brain**: A document icon with a small brain or circuit pattern overlay
2. **Layered Text**: Three horizontal lines getting progressively shorter (representing summarization)
3. **Magic Wand + Text**: A magic wand touching text lines, showing transformation
4. **Funnel Icon**: Representing the process of condensing information
5. **Robot + Document**: A friendly robot icon next to or holding a document

## Installation

Once you have created the icon files:

1. Save them in this `icons/` directory
2. Ensure they are named exactly as specified above
3. The extension will automatically use them

## Testing Icons

After adding icons:

1. Load the extension in Chrome
2. Check the toolbar icon (16px)
3. Visit chrome://extensions/ to see the 48px icon
4. The 128px icon will be used if you publish to the Chrome Web Store

## Notes

- Icons should be consistent across all sizes
- Test visibility on both light and dark backgrounds
- Consider how the icon looks when disabled/inactive
- Ensure the design is unique and not copyrighted
