# YouTube Ads Commenter

A Chrome extension that allows users to comment on YouTube ads and view comments from other users.

## Features

- Detect YouTube ads automatically
- Add comments to specific ads
- View comments from other users
- Comments are stored locally
- Clean and simple user interface

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. When watching YouTube, the extension will automatically detect ads
2. When an ad is playing, a comment button (💬) will appear in the video controls
3. Click the button to open the comment section
4. Write your comment and click "Post Comment" to add it
5. View comments from other users in the same popup

## Technical Details

- Built with Chrome Extension Manifest V3
- Uses Chrome Storage API for storing comments
- Content script for ad detection and UI injection
- Popup interface for comment management

## Note

This is a local-only extension. Comments are stored in your browser's local storage and are not shared with other users.

## License

MIT License
