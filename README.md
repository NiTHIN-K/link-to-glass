# Link to Glass - LinkedIn to Glassdoor Extension

A Chromium browser extension that adds Glassdoor search shortcuts next to company names in LinkedIn job results. It keeps company research one click away without leaving the current search.

## Features

- 🔍 **Automatic Detection**: Finds company names on LinkedIn job search results and job detail pages
- 🎯 **Smart Placement**: Adds Glassdoor buttons right next to company names
- 🚀 **One-Click Access**: Opens company Glassdoor pages in new tabs
- ⚡ **Dynamic Loading**: Works with LinkedIn's single-page application navigation

## Installation

### Install from Source (Developer Mode)

1. **Download the Extension**
   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Enable Developer Mode in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - You should see the Link to Glass icon in your Chrome toolbar
   - Navigate to LinkedIn to test the functionality

## Usage

1. **Navigate to LinkedIn**
   - Go to [linkedin.com](https://linkedin.com)
   - Search for jobs or browse job feeds

2. **Look for Glassdoor Buttons**
   - Green "🔍 Glassdoor" buttons will automatically appear next to company names
   - Buttons appear on:
     - Job search results pages
    - Supported company rows in job-result lists

3. **Click to Research**
   - Click any Glassdoor button to open that company's Glassdoor page
   - Pages open in new tabs so you don't lose your place on LinkedIn

## How It Works

The extension uses content scripts to:

1. **Monitor LinkedIn Pages**: Watches for job listings and company names
2. **Extract Company Names**: Intelligently identifies and cleans company names
3. **Add Glassdoor Links**: Inserts styled buttons that link to Glassdoor search results
4. **Handle Dynamic Content**: Works with LinkedIn's dynamic page loading

## Privacy

- **No Data Collection**: The extension doesn't collect or store any personal data
- **Local Processing**: All company name detection happens locally in your browser
- **External Links Only**: Only opens Glassdoor in new tabs when you click buttons

## Compatibility and scope

- **Chromium browsers**: Manifest V3 compatible.
- **LinkedIn job results**: The extension targets company elements in job-result lists, not every page element.
- **Glassdoor**: Opens a company search in a new tab only after a click.
- **Selector maintenance**: LinkedIn can change its page structure; update the selectors in `content.js` if buttons stop appearing.

## File Structure

```
link-to-glass/
├── manifest.json      # Extension configuration
├── content.js         # Main functionality script
├── styles.css         # Button styling
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This file
```

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## License

This project is open source and available under the MIT License.
