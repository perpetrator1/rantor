// Content script that runs on YouTube pages
let currentAdId = null;

// Function to detect YouTube ads
function detectAd() {
    const adElement = document.querySelector('.ytp-ad-player-overlay');
    if (adElement && !currentAdId) {
        // Generate a unique ID for the ad based on timestamp and random number
        currentAdId = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        injectCommentButton();
    } else if (!adElement && currentAdId) {
        // Ad is no longer playing
        currentAdId = null;
        removeCommentButton();
    }
}

// Function to inject comment button into the ad
function injectCommentButton() {
    const controls = document.querySelector('.ytp-chrome-controls');
    if (controls && !document.getElementById('ad-comment-btn')) {
        const button = document.createElement('button');
        button.id = 'ad-comment-btn';
        button.className = 'ytp-button ad-comment-btn';
        button.innerHTML = '💬';
        button.title = 'View/Add Comments';
        button.onclick = openCommentPopup;
        controls.appendChild(button);
    }
}

// Function to remove comment button when ad ends
function removeCommentButton() {
    const button = document.getElementById('ad-comment-btn');
    if (button) {
        button.remove();
    }
}

// Function to open comment popup
function openCommentPopup() {
    if (currentAdId) {
        chrome.runtime.sendMessage({
            action: 'openPopup',
            adId: currentAdId
        });
    }
}

// Start observing for ads
setInterval(detectAd, 1000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request); // Debug log
    if (request.action === 'getCurrentAdId') {
        console.log('Sending adId:', currentAdId); // Debug log
        sendResponse({ adId: currentAdId });
        return true; // Required for async response
    }
});
