# YouTube Silence Speeder

YouTube Silence Speeder is a Chrome extension that enhances your YouTube viewing experience by playing silent sections of videos at adjustable speed and volume. This allows you to save time while still enjoying the content.

## Features
- Automatically detects silent sections in YouTube videos.
- Adjust playback speed and volume for silent sections.
- Easy-to-use popup interface for customization.

## Installation
1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing this extension.

## Usage
1. Navigate to a YouTube video.
2. The extension will automatically detect silent sections.
3. Click the extension icon in the toolbar to open the popup and adjust settings.

## Permissions
This extension requires the following permissions:
- `storage`: To save user preferences.
- `tabs` and `activeTab`: To interact with the current YouTube tab.
- `host_permissions`: To access YouTube pages.

## Development
### File Structure
- `manifest.json`: Defines the extension's metadata and permissions.
- `content.js`: Contains the logic for detecting and handling silent sections.
- `popup.html`: Provides the user interface for customization.

### Scripts
- `content.js`: Injected into YouTube pages to analyze video playback.

## Contributing
Feel free to fork this repository and submit pull requests for new features or bug fixes.

## License
This project is licensed under the MIT License.
